import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MButton from '@material-ui/core/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import logger from '../utils/logger';
import { createGraphicUrl } from '../utils/url';

const useStyles = makeStyles((theme) => ({
  embedCode: {
    backgroundColor: '#eee',
    display: 'flex',
    '& button': {
      flexShrink: 0,
      borderRight: 'solid 1px rgba(0, 0, 0, 0.12)',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& pre': {
      margin: 0,
      padding: [[theme.spacing(2), theme.spacing(1)]],
      flexGrow: 1,
      flexShrink: 1,
      overflowX: 'scroll',
    },
  },
}));

const pymEmbedCode = (url: string) => {
  const pymUrl = 'https://blog.apps.npr.org/pym.js/dist/pym.v1.min.js';
  const pymDiv = `<div data-pym-src="${url}"></div>`;
  const script = `<script type="text/javascript" src="${pymUrl}"></script>`;
  return `${pymDiv}\n${script}`;
};

const iframeEmbedCode = (url: string, width = 800, height = 600) =>
  `<iframe width="${width}" height="${height}" src="${url}" frameborder="0" allowfullscreen></iframe>`;

const ampEmbedCode = (
  url: string
) => `<amp-iframe width="1" height="1" sandbox="allow-scripts allow-same-origin" layout="responsive" frameborder="0" src="${url}" resizable>
  <amp-img layout="fill" src="https://s3-eu-west-1.amazonaws.com/assets.embeddable.graphics/afp-logo.svg" placeholder></amp-img>
  <div overflow tabindex=0 role=button aria-label="Read more">Expand</div>
</amp-iframe>`;

interface Props {
  graphicId: string;
  query: string;
  width?: number;
  height?: number;
}

const EmbedLinks: React.FC<Props> = ({ graphicId, query, width, height }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [copyType, setCopyType] = useState('pym');

  let embedCode = '';
  if (graphicId) {
    const url = createGraphicUrl(graphicId, query);
    embedCode = url;
    if (copyType === 'pym') {
      embedCode = pymEmbedCode(url);
    } else if (copyType === 'iframe') {
      embedCode = iframeEmbedCode(url, width, height);
    } else if (copyType === 'amp') {
      embedCode = ampEmbedCode(url);
    }
  }

  return (
    <>
      <Tabs
        variant="fullWidth"
        centered
        value={copyType}
        onChange={(e, v) => {
          logger.info('Dashboard/Preview/Change-Link-Type', {
            link: v,
          });
          setCopyType(v);
        }}>
        <Tab label="Direct Link" value="link" />
        <Tab
          style={{ color: '#009456' }}
          label="Pym (Responsive)"
          value="pym"
        />
        <Tab
          style={{ color: '#F15B67' }}
          label="Iframe (Not Responsive)"
          value="iframe"
        />
        <Tab style={{ color: '#F15B67' }} label="AMP (beta)" value="amp" />
      </Tabs>
      <div className={classes.embedCode}>
        <CopyToClipboard
          text={embedCode}
          onCopy={(t) => {
            logger.info('Dashboard/Preview/onCopy-Handler');
            logger.debug('Text copied', { text: t });
          }}>
          <MButton>{t('graphic_preview.copy')}</MButton>
        </CopyToClipboard>
        <pre>{embedCode}</pre>
      </div>
    </>
  );
};

export default EmbedLinks;
