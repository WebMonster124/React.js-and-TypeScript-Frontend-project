import axios from './axios';
import { Graphic, GraphicBody } from '../../types';

export const deleteGraphic = async (graphicId: string): Promise<void> => {
  const res = await axios.delete(`/graphicVersions?graphicId=${graphicId}`);
  if (!res.data?.success) throw res.data?.error;
};

export const getGraphics = async (
  graphicTypeId: string
): Promise<Graphic[]> => {
  const res = await axios.get(`/graphicVersions`, {
    params: {
      graphicTypeId,
    },
  });
  if (res.data?.success) return res.data?.items;
  else throw res.data?.error;
};

export const getGraphic = async (graphicId: string): Promise<Graphic> => {
  const res = await axios.get(`/graphicById`, {
    params: {
      graphicId,
    },
  });
  if (res.data?.success) return res.data?.items;
  else throw res.data?.error;
};

export const createGraphic = async (graphic: Graphic): Promise<void> => {
  const res = await axios.post(`/graphicVersions`, graphic);
  if (!res.data?.success) throw res.data?.error;
};

export const updateGraphic = async (
  graphicId: string,
  body: GraphicBody
): Promise<void> => {
  const res = await axios.patch(
    `/graphicVersions?graphicId=${graphicId}`,
    body
  );
  if (!res.data?.success) throw res.data?.error;
};

export const duplicateGraphicVersion = async (
  sourceGraphicId: string,
  newGraphicId: string,
  newGraphicName: string
): Promise<void> => {
  const res = await axios.post(`/graphicVersions/copy`, {
    sourceGraphicId,
    newGraphicId,
    newGraphicName,
  });
  if (!res.data?.success) throw res.data?.error;
};
