import env from '../env';

export const notifyBundleJsUpload = (
  graphicTypeId: string,
  graphicTypeName: string,
  author: string
): Promise<any> => {
  if (!env.ZAPIER_ENABLED) return Promise.resolve();
  return fetch('https://hooks.zapier.com/hooks/catch/3387467/buhnjdy/', {
    method: 'post',
    body: JSON.stringify({
      headline: 'New bundle.js uploaded',
      graphicTypeId,
      graphicTypeName,
      author: author,
      host: location.host,
    }),
  });
};
