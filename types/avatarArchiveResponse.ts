export interface AvatarArchiveResponse {
    data: {
      records: AvatarRecord[];
      cursor: string;
    };
    headers: Record<string, string>;
    success: boolean;
  }
  
  export interface AvatarRecord {
    uri: string;
    cid: string;
    value: {
      blob: {
        ref: {
          $type: 'blob';
          ref: {
            $link: string;
          };
          mimeType: string;
          size: number;
        };
        mimeType: string;
      };
      meta: AvatarParams;
      $type: 'net.nornoe.avatarArchive';
      createdAt: string;
    };
  }

  export interface AvatarParams {
    eyes: string;
    color: string;
    mouth: string;
    shape: string;
    rotation: number;
    background: string;
  }
  