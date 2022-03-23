import { Config } from './config';

export interface GraphicBody {
  [key: string]: any;
}

export interface GraphicUpdates {
  body?: GraphicBody;
  configOnline?: Config;
  configOnlineLastUpdate?: string;
  css0Online?: string;
  css0OnlineLastUpdate?: string;
  css0Test?: string;
  css0TestLastUpdate?: string;
  dataApiEndpoint?: string;
  dataCode?: string;
  dataOnline?: any;
  dataOnlineLastUpdate?: string;
  dataTest?: any;
  dataTestLastUpdate?: string;
  deletable?: boolean;
  descriptorsOnline?: any;
  descriptorsOnlineLastUpdate?: string;
  descriptorsTest?: any;
  descriptorsTestLastUpdate?: string;
  editorVisible?: boolean;
  endOfSupport?: string;
  exec_interval?: number;
  graphicBrowserDescription?: string;
  graphicBrowserTitle?: string;
  graphicName?: string;
  graphicTypeId?: string;
  isFavorite?: boolean;
  isLocked?: boolean;
  key?: string;
  manualDataDate?: string;
  notes?: string;
  result_destition?: string;
  updateFrequencyInMonth?: number;
  viewerVisible?: boolean;
}

export interface Graphic extends GraphicUpdates {
  graphicId: string;
}
