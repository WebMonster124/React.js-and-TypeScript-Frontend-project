import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { RematchDispatch } from '@rematch/core';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Fuse from 'fuse.js';

import { RootModel, RootState, store } from '../../redux';
import { useTesterCheck } from '../../hooks/use-role-check';
import logger from '../../utils/logger';
import Title from '../../components/Title';
import Default from '../../components/Default';
import FeedbackEntry from './FeedbackEntry';
import Loader from '../../components/Loader';

export const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    margin: '20px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    margin: theme.spacing(3) / 2,
    flexBasis: '250px',
    flexGrow: 1,
    display: 'flex',
  },
  titleText: {
    fontSize: 22,
    flexGrow: 1,
    display: 'flex',
    fontFamily: '"Playfair Display", serif',
  },
  searchform: {
    margin: `0 ${theme.spacing(3) / 2}px`,
    border: '1px solid #eee',
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    flexBasis: '250px',
    flexGrow: 1,
  },
  feedbackList: {
    display: 'flex',
    flexWrap: 'wrap',
    overflowY: 'scroll',
    padding: '10px',
  },
  input: {},
}));

const FeedbackDashboard = (props: StateProps & DispatchProps) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const isTester = useTesterCheck(props.user, props.showAs);

  useEffect(() => {
    props.getFeedback().catch((err) => {
      logger.error('Error getting feedback', err);
      enqueueSnackbar('Error getting Feedback');
    });
  }, [props.getFeedback, enqueueSnackbar]);

  // Setup filtering stuff
  const searchIndex = useRef(null);
  const [query, setQuery] = useState('');
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  useEffect(() => {
    searchIndex.current = new Fuse(props.feedback, {
      keys: [
        'graphicTypeName',
        'graphicVersionName',
        'feedbackMessage',
        'message',
        'userName',
        'userEmail',
      ],
    });
  }, [props.feedback]);

  // Filter feedbacks everytime the query or feedbacks changes
  useEffect(() => {
    if (searchIndex.current && query) {
      const result = searchIndex.current.search(query);
      setFilteredFeedbacks(result.map((el) => el.item));
    } else setFilteredFeedbacks(props.feedback || []);
  }, [query, props.feedback]);

  // Update the query according to the input
  const handleSearch = (e: any) => {
    setQuery(e.target.value);
  };

  if (!isTester) return <div />;

  return (
    <div className={classes.root}>
      {props.feedback.length <= 0 ? (
        <Default
          header="No Feedback"
          message="Once a user submits a Feedback it will appear here."
        />
      ) : (
        <>
          <div className={classes.header}>
            <div className={classes.title}>
              <Title className={classes.titleText} title="Feedback List" />
              {props.loading ? <Loader size={26} /> : null}
            </div>
            <div className={classes.searchform}>
              <IconButton aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase
                fullWidth
                value={query}
                onChange={handleSearch}
                className={classes.input}
                placeholder="Search feedback..."
              />
            </div>
          </div>
          <div className={classes.feedbackList}>
            {filteredFeedbacks.map((fb, i) => (
              <FeedbackEntry
                key={fb.feedbackId || i}
                feedback={fb}
                classes={classes}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const mapState = (state: RootState) => ({
  showAs: state.app.showAs,
  user: state.auth,
  feedback: store.select.feedback.allFeedback(state),
  loading: state.loading.effects.feedback.getFeedback,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  getFeedback: dispatch.feedback.getFeedback,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(FeedbackDashboard);
