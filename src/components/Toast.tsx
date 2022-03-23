import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core/styles';
import DoneOutlinedIcon from '@material-ui/icons/DoneOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';

import { RootState } from '../redux';
import { RootModel } from '../redux/models';

const useStyles = makeStyles(() => ({
  toast: {
    backgroundColor: '#e1fce1',
    borderRadius: 4,
    maxWidth: 480,
    minWidth: 200,
    boxShadow: '0px 0px 5px rgba(0, 0, 0, .2)',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'absolute',
    cursor: 'pointer',
    left: 30,
    bottom: 30,
    padding: 10,
    transform: 'translateX(-200%)',
    transition: 'all 0.1s ease-in-out',
    zIndex: 9000,
  },
  error: {
    backgroundColor: '#ffe1de',
  },
  show: {
    transform: 'translateX(0px)',
    transition: 'all 0.2s ease-in-out',
  },
  message: {
    paddingLeft: 10,
    paddingRight: 10,
    margin: 0,
  },
}));

const Toast: React.FC<StateProps & DispatchProps> = (props) => {
  const classes = useStyles();
  const { showing, handleHideToast } = props;

  useEffect(() => {
    // Hide toast after 3.5 seconds
    if (showing) {
      setTimeout(() => handleHideToast(), 3500);
    }
  }, [handleHideToast, showing]);

  const className = `${classes.toast} ${props.error ? classes.error : ''} ${
    props.showing ? classes.show : ''
  }`;
  return (
    <div className={className}>
      {props.error ? (
        <ErrorOutlineOutlinedIcon color="error" />
      ) : (
        <DoneOutlinedIcon />
      )}
      <p className={classes.message}>{props.message}</p>
    </div>
  );
};

const mapState = (state: RootState) => ({
  ...state.toast,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  handleHideToast: dispatch.toast.handleHideToast,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(Toast);
