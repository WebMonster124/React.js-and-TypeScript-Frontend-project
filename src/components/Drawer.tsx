import React from 'react';
import MuiDrawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  drawerWrapper: ({ width }: { width: number | string }) => ({
    position: 'relative',
    width: width,
  }),
  drawer: ({ width }) => ({
    width: width,
  }),
  drawerPaper: {
    position: 'absolute',
    width: '100%',
  },
});

interface Props {
  width: number | string;
}

const Drawer: React.FC<Props> = ({ width, children }) => {
  const classes = useStyles({ width });
  return (
    <div className={classes.drawerWrapper}>
      <MuiDrawer
        className={classes.drawer}
        variant="permanent"
        classes={{ paper: classes.drawerPaper }}>
        {children}
      </MuiDrawer>
    </div>
  );
};

export default Drawer;
