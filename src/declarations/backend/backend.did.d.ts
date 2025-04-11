import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'checkFileExists' : ActorMethod<[string], boolean>,
  'deleteFile' : ActorMethod<[string], boolean>,
  'getFileChunk' : ActorMethod<[string, bigint], [] | [Uint8Array | number[]]>,
  'getFileMetadata' : ActorMethod<
    [string],
    [] | [
      {
        'title' : string,
        'content' : string,
        'additionalContent' : string,
        'remarks' : string,
      }
    ]
  >,
  'getFileType' : ActorMethod<[string], [] | [string]>,
  'getFiles' : ActorMethod<
    [],
    Array<
      {
        'title' : string,
        'content' : string,
        'name' : string,
        'size' : bigint,
        'fileType' : string,
        'additionalContent' : string,
        'remarks' : string,
      }
    >
  >,
  'getTotalChunks' : ActorMethod<[string], bigint>,
  'uploadFileChunk' : ActorMethod<
    [
      string,
      string,
      string,
      string,
      string,
      Uint8Array | number[],
      bigint,
      string,
    ],
    undefined
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
