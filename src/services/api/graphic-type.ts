import axios from './axios';
import { GraphicType, GraphicTypeBody } from '../../types';

export const getGraphicTypes = async (): Promise<GraphicType[]> => {
  const res = await axios.get('/graphicTypes');
  if (!res.data?.success) throw res.data?.error;
  return await res.data?.items;
};

export const updateGraphicType = async (
  graphicTypeId: string,
  body: GraphicTypeBody
): Promise<any> => {
  const res = await axios.patch(
    `/graphicTypes?graphicTypeId=${graphicTypeId}`,
    body
  );
  if (!res.data?.success) throw res.data?.error;
  return res.data;
};

export const deleteGraphicType = async (
  graphicTypeId: string
): Promise<any> => {
  const res = await axios.delete(
    `/graphicTypes?graphicTypeId=${graphicTypeId}`
  );
  if (!res.data?.success) throw res.data?.error;
  return res.data;
};

export const saveGraphicType = async (
  graphicTypeId: string,
  graphicTypeName?: string
): Promise<void> => {
  const res = await axios.post('/graphicTypes', {
    graphicTypeName,
    graphicTypeId,
  });
  if (!res.data?.success) throw res.data?.error;
};

export const getGraphicType = async (
  graphicTypeId: string
): Promise<GraphicType> => {
  const res = await axios.get(`/graphicTypes`, {
    params: {
      graphicTypeId,
    },
  });
  if (!res.data?.success) throw res.data?.error;
  return res.data?.items;
};

export const getSignedUrl = async (
  graphicTypeId: string,
  key: string
): Promise<string> => {
  const res = await axios.get('graphicTypes/upload', {
    params: {
      graphicTypeId,
      dynamoKey: key,
    },
  });
  if (res.data?.status_code === 200) {
    return res.data?.upload_url;
  }
  throw new Error('Could not get the URL');
};
