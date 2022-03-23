import { Config } from './config';

export interface GraphicTypeBody {
  [key: string]: any;
}

export interface GraphicType {
  pathToDataTutorialVideo?: string;
  pathToJS?: string;
  pathToThumbnail?: string;
  dataDefault?: any;
  descriptorsDefault?: any;
  cssDefault?: string;
  viewerVisible?: boolean;
  editorVisible?: boolean;
  configDefault?: Config;
  graphicTypeId: string;
  graphicTypeName?: string;
  graphicName?: string;
  body?: GraphicTypeBody;
  isFavorite?: boolean;
}
