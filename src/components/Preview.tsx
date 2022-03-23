import React, {
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';

import { Config, Graphic } from '../types';
import { createGraphicUrl } from '../utils/url';

export const useStyles = makeStyles({
  resizer: {
    background: '#000',
    opacity: 0.2,
    minWidth: 11,
    margin: '0 -5px',
    'border-left': '5px solid rgba(255, 255, 255, 0)',
    'border-right': '5px solid rgba(255, 255, 255, 0)',
    cursor: 'col-resize',
    'box-sizing': 'border-box',
    'background-clip': 'padding-box',
    '&:hover': {
      transition: 'all 2s ease',
      'border-left': '5px solid rgba(0, 0, 0, 0.5)',
      'border-right': '5px solid rgba(0, 0, 0, 0.5)',
    },
  },
  paneWrapper: {
    minHeight: 200,
    position: 'relative',
  },
  widthMarker: {
    position: 'absolute',
    backgroundColor: '#a9cdfc',
    padding: '2px 4px',
    fontWeight: 500,
  },
});

export interface Props {
  graphic: Graphic;
  wrapperId: string;
  query?: string;
  configDefault?: Config;
  defaultPreviewWidth?: number;
  changedWidth?(width: number): void;
  changedHeight?(height: number): void;
}

export interface API {
  reload(): void;
}

const Core = (props: Props, ref: React.Ref<API>) => {
  const classes = useStyles();

  const { defaultPreviewWidth = 740 } = props;

  const [width, setWidth] = useState(defaultPreviewWidth);
  const [height, setHeight] = useState(200);
  const [resizing, setResizing] = useState(false);

  const view = useRef(null);
  const interval = useRef(null);

  const {
    wrapperId,
    graphic: { graphicId },
    query,
    changedWidth,
    changedHeight,
  } = props;

  useEffect(() => changedWidth?.(width), [changedWidth, width]);
  useEffect(() => changedHeight?.(height), [changedHeight, height]);

  const reload = useCallback(() => {
    if ((window as any).pym && graphicId) {
      if (view.current) view.current.remove();
      if (interval.current) clearInterval(interval.current);
      view.current = new (window as any).pym.Parent(
        wrapperId,
        createGraphicUrl(graphicId, query)
      );
      view.current.onMessage('height', (h: string | number) => {
        if (h) setHeight(Number(h));
      });
      interval.current = setInterval(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
      return () => {
        view.current.remove();
        view.current = null;
        clearInterval(interval.current);
        interval.current = null;
      };
    }
  }, [wrapperId, query, graphicId]);

  useEffect(() => reload(), [reload]);

  useImperativeHandle(ref, () => ({ reload }), [reload]);

  return (
    <div className={classes.paneWrapper} style={{ height }}>
      <SplitPane
        resizerClassName={classes.resizer}
        pane2Style={{ pointerEvents: 'none' }}
        onDragStarted={() => setResizing(true)}
        onDragFinished={() => setResizing(false)}
        split="vertical"
        minSize={160}
        onChange={setWidth}
        maxSize={-6}
        defaultSize={defaultPreviewWidth}>
        <div
          id={wrapperId}
          style={{ pointerEvents: resizing ? 'none' : 'auto' }}
        />
        <span className={classes.widthMarker}>{width}px</span>
      </SplitPane>
    </div>
  );
};

export default forwardRef(Core);
