import React, { useState } from 'react';
import {
  Link as RouterLink,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import { Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DeveloperBoard from '@material-ui/icons/DeveloperBoard';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import TextField from '@material-ui/core/TextField';
import { useTranslation } from 'react-i18next';

import { AuthUser, Graphic, GraphicType } from '../../types';
import {
  useDeveloperCheck,
  useEditorCheck,
  useTesterCheck,
} from '../../hooks/use-role-check';
import { useGraphicAccessCheck } from '../../hooks/use-graphic-access-check';

const useStyles = makeStyles({
  titleContainer: {
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  screenTitle: {
    color: '#17275f',
    fontWeight: 500,
    fontSize: 25,
    fontFamily: 'Rubik',
    marginLeft: 28,
    marginRight: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

interface Props extends RouteComponentProps {
  user: AuthUser;
  showAs: string;
  // name: string;
  graphic?: Graphic;
  graphicType?: GraphicType;
  graphicTypeId?: string;
  showGraphicTypeSettings?: boolean;
  onRename?(name: string): void;
}

const BackTitle = withRouter((props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { graphic, graphicType, showAs, user } = props;
  const propsName = graphicType?.graphicTypeName || graphic?.graphicName || '';

  const hasAccess = useGraphicAccessCheck(user, showAs)(graphicType || graphic);
  const isDeveloper = useDeveloperCheck(props.user, props.showAs);
  const isEditor = hasAccess && useEditorCheck(props.user, props.showAs);
  const isTester = useTesterCheck(props.user, props.showAs);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(propsName);
  const historyState = (props.history.location.state || {}) as {
    fromIP3?: boolean;
  };
  const canGoBack = historyState.fromIP3;

  const editorAccess = props.user?.editorAccess;
  const restricted = editorAccess?.length > 0;
  const defaultsAccess = !restricted || editorAccess.includes('defaults');

  return (
    <div className={classes.titleContainer}>
      <NavigateBeforeIcon
        style={{ color: 'black', verticalAlign: 'bottom', cursor: 'pointer' }}
        onClick={() =>
          canGoBack
            ? props.history.goBack()
            : props.history.replace('/dashboard')
        }
      />
      {isTester ? (
        <Typography className={classes.screenTitle} component="h1">
          {propsName}
        </Typography>
      ) : null}
      {isEditor ? (
        <IconButton
          onClick={() => {
            setName(propsName);
            setOpen(true);
          }}>
          <EditIcon />
        </IconButton>
      ) : null}
      {isDeveloper &&
      props.showGraphicTypeSettings &&
      props.graphicTypeId &&
      defaultsAccess ? (
        <Link
          component={RouterLink}
          to={{
            pathname: '/edit/' + props.graphicTypeId,
            state: { fromIP3: true },
          }}
          style={{}}>
          <IconButton>
            <DeveloperBoard />
          </IconButton>
        </Link>
      ) : null}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => setOpen(false)}>
        <DialogTitle>{t('appbar.rename_to')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t('appbar.rename_cancel')}
          </Button>
          <Button
            onClick={() => {
              if (props.onRename) props.onRename(name);
              setOpen(false);
            }}>
            {t('appbar.rename_submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});

export default BackTitle;
