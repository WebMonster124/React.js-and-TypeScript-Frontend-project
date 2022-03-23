import axios from './axios';

export const getAssetSignedUrl = async (
  graphicId: string,
  filename: string
): Promise<string> => {
  const res = await axios.get('graphicVersions/upload', {
    params: {
      graphicVersionId: graphicId,
      assetFileName: filename,
    },
  });
  if (res.data?.status_code === 200) {
    return res.data?.upload_url;
  }
  throw new Error('Could not get the URL');
};

export const getAssets = async (graphicId: string): Promise<any[]> => {
  const res = await axios.get('graphicVersions/assets', {
    params: {
      graphicVersionId: graphicId,
    },
  });
  if (!res.data?.success) throw res.data?.error;
  return res.data?.assets;
};

export const deleteAsset = async (
  graphicId: string,
  assetFileName: string
): Promise<void> => {
  const res = await axios.delete('graphicVersions/assets', {
    params: {
      graphicVersionId: graphicId,
      assetFileName,
    },
  });
  if (!res.data?.success) throw res.data?.error;
  return res.data;
};
