import React from 'react';

interface Props {
  value: string;
  selectedTab: string;
  keepChildren?: boolean;
}

const TabPanel: React.FC<Props> = (props) => {
  const { value, selectedTab, keepChildren, children } = props;
  const visible = value === selectedTab;
  return (
    <div
      role="tabpanel"
      // hidden={!visible} // uses `display: none` which is slow
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      style={{
        // following lines execute a lot quicker than `display: none`
        height: visible ? 'auto' : 0,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        overflow: 'hidden',
      }}>
      {keepChildren ? children : value === selectedTab && children}
    </div>
  );
};

export default TabPanel;
