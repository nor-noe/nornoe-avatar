<script setup lang="ts">
import SHAPES from '@/types/shapes.enum'
import { eyesMap as EYES, type EyesType } from './SelectedEyes.vue'
import { mouthMap as MOUTH, type MouthType } from './SelectedMouth.vue'
import type { AvatarParams } from '@/types/avatarArchiveResponse';

const props = defineProps<{
    params: AvatarParams | null
}>()

const isLoading = ref(false)
const isDone = ref(false)
const onCooldown = ref<boolean | number>(false)

const shapeIndex = ref(0)
const shapeKeys = Object.keys(SHAPES) as (keyof typeof SHAPES)[]
const shapeValues = Object.values(SHAPES)
const shapeLabel = computed(() => shapeKeys[shapeIndex.value])
const shapePath = computed(() => shapeValues[shapeIndex.value])

const eyesIndex = ref(0)
const eyesKeys = Object.keys(EYES) as EyesType[]

const mouthIndex = ref(0)
const mouthKeys = Object.keys(MOUTH) as MouthType[]


const color = ref('#ffae00')
const backgroundColor = computed(() => {
  const isDark = isDarkColor(color.value)
  return isDark ? '#ccc' : '#000'
})

const rotation = ref('0')
const svgRef = ref<SVGSVGElement>()


const faceOffset = computed(() => {
  const intensity = 20
  const angle = (parseInt(rotation.value) * Math.PI) / 180
  const x = -Math.sin(angle) * intensity
  const y = Math.cos(angle) * intensity
  return `translate(${x}, ${y}) scale(1.4)`
})

watchEffect(() => {
    if (props.params) {
        shapeIndex.value = shapeValues.indexOf(props.params.shape as SHAPES)
        eyesIndex.value = eyesKeys.indexOf(props.params.eyes as EyesType)
        mouthIndex.value = mouthKeys.indexOf(props.params.mouth as MouthType)
        color.value = props.params.color
        rotation.value = `${props.params.rotation}`
    }
})

function isDarkColor(hex: string): boolean {
    const cleaned = hex.replace('#', '')

    const r = parseInt(cleaned.substring(0, 2), 16)
    const g = parseInt(cleaned.substring(2, 4), 16)
    const b = parseInt(cleaned.substring(4, 6), 16)

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return luminance < 0.15
}

const randomize = () => {
    shapeIndex.value = Math.floor(Math.random() * shapeValues.length)
    eyesIndex.value = Math.floor(Math.random() * eyesKeys.length)
    mouthIndex.value = Math.floor(Math.random() * mouthKeys.length)
    color.value = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`
    rotation.value = `${Math.floor(Math.random() * 360)}`
}


const updateProfilePic = async () => {
    const payload = {
        background: backgroundColor.value,
        shape: shapePath.value,
        eyes: eyesKeys[eyesIndex.value],
        mouth: mouthKeys[mouthIndex.value],
        color: color.value,
        rotation: parseInt(rotation.value),
    }
    isLoading.value = true
    const { data, error } = await useFetch('/api/setAvatar', {
        method: 'POST',
        body: payload,
    })

    isLoading.value = false

    if (error.value) {
        console.error('Error updating profile', error.value)
        console.log(error)

        if (error.value.data.statusCode === 429 && error.value.data?.data.data.secondsRemaining) {

            const secondsLeft = error.value.data.data.data.secondsRemaining
            console.log(`Retry in ${secondsLeft} seconds`)
            onCooldown.value = secondsLeft

            const cooldownInterval = setInterval(() => {
                if (typeof onCooldown.value === 'number' && onCooldown.value > 0) {
                    onCooldown.value--
                } else {
                    clearInterval(cooldownInterval)
                    onCooldown.value = false
                }
            }, 1000)
        }
        return
    } else {
        isDone.value = true
    }

    console.log('Profile updated successfully', data.value)
}
</script>

<template>
    <div class="avatar-wrapper">
      <svg
        ref="svgRef"
        id="avatar-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="512"
        height="512"
      >
        <!-- Black circle -->
        <circle cx="256" cy="256" r="256" :fill="backgroundColor" />
  
        <!-- Shape -->
        <g :transform="`rotate(${rotation}, 256, 256)`">
            <path
                :fill="color"
                :d="shapePath"
            />
        </g>
  
        <!-- Face -->
        <g :transform="faceOffset" style="transform-origin: center">
            <SelectedEyes :type="eyesKeys[eyesIndex]" />
            <SelectedMouth :type="mouthKeys[mouthIndex]" />
        </g>
      </svg>
  
      <div class="controls">
        <div class="selector shape-selector">
            <button class="selector-cta previous-shape" @click="shapeIndex = (shapeIndex - 1 + shapeValues.length) % shapeValues.length">
                <Icon name="ic:round-chevron-left" size="32"/>
            </button>
            <div class="selector-value shape-label">
                <Icon class="selector-icon" name="fluent-emoji-high-contrast:bust-in-silhouette" size="24"/>
                <div class="selector-label">{{ shapeLabel.toLowerCase() }}</div>
            </div>
            <button class="selector-cta next-shape" @click="shapeIndex = (shapeIndex + 1) % shapeValues.length">
                <Icon name="ic:round-chevron-right"  size="32"/>
            </button>
        </div>
        <div class="selector eyes-selector">
            <button class="selector-cta previous-shape" @click="eyesIndex = (eyesIndex - 1 + eyesKeys.length) % eyesKeys.length">
                <Icon name="ic:round-chevron-left" size="32"/>
            </button>
            <div class="selector-value">
                <Icon class="selector-icon" name="fluent-emoji-high-contrast:eye" size="24"/>
                <div class="selector-label">{{ eyesKeys[eyesIndex] }}</div>
            </div>
            <button class="selector-cta next-shape" @click="eyesIndex = (eyesIndex + 1) % eyesKeys.length">
                <Icon name="ic:round-chevron-right"  size="32"/>
            </button>
        </div>
        <div class="selector mouth-selector">
            <button class="selector-cta previous-shape" @click="mouthIndex = (mouthIndex - 1 + mouthKeys.length) % mouthKeys.length">
                <Icon name="ic:round-chevron-left" size="32"/>
            </button>
            <div class="selector-value">
                <Icon class="selector-icon" name="fluent-emoji-high-contrast:mouth" size="24"/>
                <div class="selector-label">{{ mouthKeys[mouthIndex] }}</div>
            </div>
            <button class="selector-cta next-shape" @click="mouthIndex = (mouthIndex + 1) % mouthKeys.length">
                <Icon name="ic:round-chevron-right"  size="32"/>
            </button>
        </div>
        <div class="color-input-container">
            <Icon  class="selector-icon" name="fluent-emoji-high-contrast:artist-palette" size="24" :style="{color: backgroundColor}"/>
            <input class="color-input" type="color" v-model="color" />
        </div>
        <div class="rotation-input-container">
            <input type="range" min="0" max="360" v-model="rotation" />
        </div>
        <div class="ctas">
            <button class="random-cta" @click="randomize">
                <Icon class="random-icon" name="fluent-emoji-high-contrast:game-die" size="24"/>
            </button>
            <button class="confirm-cta" @click="updateProfilePic" :disabled="isLoading || isDone || !!onCooldown" :class="{ done: isDone }">
                <div v-if="isLoading" class="loader">
                    <Icon class="loader-icon" name="fluent-emoji-high-contrast:hourglass-not-done" size="24"/>
                </div>
                <div v-else-if="onCooldown" class="cooldown">
                    <div>Retry in {{ onCooldown }} seconds</div>
                    <Icon class="loader-icon" name="fluent-emoji-high-contrast:hourglass-not-done" size="16"/>
                </div>
                <div v-else-if="isDone" class="done">
                    <div>Done</div>
                    <Icon name="fluent-emoji-high-contrast:party-popper" size="16"/>
                </div>
                <span v-else>Confirm</span>
            </button>
        </div>
      </div>
    </div>
  </template>

<style lang="scss" scoped>
.avatar-wrapper {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4rem;
    max-width: 920px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
}
#avatar-svg {
    max-width: 100%;
    height: auto;
    clip-path: circle(50%);
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;

    .selector {
        display: flex;

        .selector-value {
            width: 260px;
            border: 1px solid #ccc;
            text-transform: capitalize;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-radius: 4px;
            position: relative;
            font-size: 1rem;

            .selector-icon {
                position: absolute;
                top: calc(50% - 12px);
                left: 0.5rem;
                color: #ccc
            }
        }

        .selector-cta {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.25rem;
            color: #333;
            transition: all 0.3s ease;

            &:hover {
                color: #000;
            }

            &.previous-shape {
                &:hover {
                    transform: translateX(-2px);
                }
            }
            &.next-shape {
                &:hover {
                    transform: translateX(2px);
                }
            }
        }
    }

    .color-input-container {
        position: relative;

        .color-input {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 272px;
            height: 52px;
            background-color: transparent;
            border: none;
            cursor: pointer;

            &::-webkit-color-swatch {
                border-radius: 4px;
                border: 1px solid black;
            }
            &::-moz-color-swatch {
                border-radius: 4px;
                border: 1px solid black;
            }
        }

        .selector-icon {
            position: absolute;
            top: calc(50% - 12px);
            left: 0.75rem;
            color: black;
            transition: all 0.3s ease;
        }
    }

    .rotation-input-container {
        input[type="range"] {
            width: 272px;
            height: 8px;
            background: #ddd;
            border-radius: 4px;
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s;

            &:hover {
                opacity: 1;
            }

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: #333;
                border-radius: 50%;
                cursor: pointer;
            }
        }
    }

    .ctas {
        width: 272px;
        height: 52px;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;

        .random-cta {
            width: 52px;
            height: 52px;
            background-color: white;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
            box-sizing: border-box;
            border: 2px solid #333;
            transition: all 0.3s ease;

            &:hover {
                background-color: #f5f5f5;
            }

        }
    }

    .confirm-cta {
        background-color: #333;
        flex-grow: 1;
        height: 100%;
        font-size: 1rem;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:disabled {
            cursor: default;
        }

        &.done {
            background-color: #208bfe;
            color: white;
        }

        &:hover:not(:disabled) {
            background-color: #555;
        }

        .loader {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ccc;
            animation: spin 2s ease-in-out infinite;
        }

        .cooldown {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
        }

        .done {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
        }
    }
}

@keyframes spin {
    0% {
    transform: rotate(0deg) translateY(0);
  }
  5% {
    transform: rotate(0deg) translateY(-3px);
  }
  10% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(180deg) translateY(0);
  }
  50% {
    transform: rotate(180deg) translateY(0);
  }
  55% {
    transform: rotate(180deg) translateY(-3px);
  }
  60% {
    transform: rotate(180deg) translateY(0);
  }
  75% {
    transform: rotate(360deg) translateY(0);
  }
  100% {
    transform: rotate(360deg) translateY(0);
  }
}
</style>
