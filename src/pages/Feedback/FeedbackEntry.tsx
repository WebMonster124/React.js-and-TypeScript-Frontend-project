import React from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { makeStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { RootModel, RootState } from '../../redux';
import { Feedback } from '../../types';
import { useEditorCheck } from '../../hooks/use-role-check';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    flexBasis: '450px',
    margin: '10px',
    padding: '24px',
    cursor: 'pointer',
    display: 'flex',
    flexWrap: 'wrap',
  },
  feedbackTopRow: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feedbackDeleteButton: {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    color: 'red',
  },
  feedbackGraphicDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  feedbackGraphicName: {
    color: '#ff9e44',
    fontFamily: 'Playfair Display',
    fontSize: '20px',
    fontWeight: 400,
    fontStyle: 'normal',
    letterSpacing: '0.6px',
    lineHeight: 'normal',
    margin: '6px',
  },
  feedbackGraphicVersion: {
    color: '#a4a4a4',
    fontFamily: 'Rubik',
    fontSize: '14px',
    fontWeight: 400,
    fontStyle: 'normal',
    letterSpacing: 'normal',
    lineHeight: 'normal',
    textAlign: 'left',
    margin: '6px',
  },
  feedbackMessage: {
    width: '100%',
    margin: '6px',
    color: '#000000',
    fontFamily: 'Rubik',
    fontSize: '20px',
    fontWeight: 500,
    fontStyle: 'normal',
    letterSpacing: 'normal',
    lineHeight: 'normal',
    textAlign: 'left',
  },
  feedbackUserDetails: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feedbackUserName: {
    margin: '6px',
  },
  feedbackUserEmail: {
    margin: '6px',
  },
  feedbackUserType: {
    margin: '6px',
  },
  feedbackTags: {},
  separator: {
    background: 'black',
    margin: '6px',
    width: '4px',
    height: '4px',
    borderRadius: '100%',
  },
  input: {},
});

interface Props extends StateProps, DispatchProps {
  feedback: Feedback;
}

const FeedbackEntry = (props: Props) => {
  const classes = useStyles();
  const isEditor = useEditorCheck(props.user, props.showAs);

  const { feedback } = props;

  const onClickDelete = () => {
    props.deleteFeedback(feedback.feedbackId);
  };

  return (
    <Paper className={classes.root}>
      <span className={classes.feedbackTopRow}>
        <span className={classes.feedbackGraphicDetails}>
          <span className={classes.feedbackGraphicName}>
            {feedback.graphicTypeName}
          </span>
          <span className={classes.feedbackGraphicVersion}>
            {feedback.graphicId}
          </span>
        </span>
        {isEditor ? (
          <IconButton
            className={classes.feedbackDeleteButton}
            onClick={onClickDelete}
            disabled={!props.feedback.feedbackId}>
            <DeleteIcon />
          </IconButton>
        ) : null}
      </span>
      <span className={classes.feedbackMessage}>
        {feedback.message || feedback.feedbackMessage || 'No Feedback Message'}
      </span>
      <span className={classes.feedbackUserDetails}>
        {[
          [classes.feedbackUserName, feedback.userName],
          [classes.feedbackUserEmail, feedback.userEmail],
          [classes.feedbackUserType, feedback.feedbackType],
        ]
          .filter((val) => val[1])
          .reduce(
            (acc, val, i) => [
              ...acc,
              <span key={i} className={val[0]}>
                {val[1]}
              </span>,
              <span key={i + 'separator'} className={classes.separator} />,
            ],
            []
          )
          .slice(0, -1)}
      </span>
      <span className={classes.feedbackTags}></span>
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  showAs: state.app.showAs,
  user: state.auth,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  deleteFeedback: dispatch.feedback.deleteFeedback,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(FeedbackEntry);
