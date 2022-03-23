import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next';

import { useEditorCheck } from '../../hooks/use-role-check';
import Editor from '../../components/Editor';
import Button from '../../components/Button';
import { GraphicType } from '../../types';
import { RootModel, RootState } from '../../redux';
import { RematchDispatch } from '@rematch/core';

const useStyles = makeStyles({
  root: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 48,
    margin: 10,
  },
  title: {
    textTransform: 'none',
  },
  editor: {
    margin: 10,
    marginTop: 0,
  },
  actions: {
    margin: 10,
    display: 'flex',
  },
});

interface Props extends StateProps, DispatchProps {
  tab: string;
  graphicType: GraphicType;
}

const CheckFunctionEditor = (props: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const isEditor = useEditorCheck(props.user, props.showAs);

  const [code, setCode] = useState('');

  const { graphicType = {} as GraphicType, tab } = props;

  useEffect(() => {
    let key = '';
    if (graphicType) {
      switch (tab) {
        case 'data':
          key = 'jsonDataCheckFunction';
          break;
        case 'descriptors':
          key = 'descriptorsCheckFunction';
          break;
        case 'config':
          key = 'configCheckFunction';
          break;
        case 'css':
          key = 'cssCheckFunction';
          break;
        default:
      }
    }
    setCode(graphicType[key] || '');
  }, [graphicType, tab]);

  const handleSave = () => {
    let key = '';
    const body = {};
    switch (tab) {
      case 'data':
        key = 'jsonDataCheckFunction';
        break;
      case 'descriptors':
        key = 'descriptorsCheckFunction';
        break;
      case 'config':
        key = 'configCheckFunction';
        break;
      case 'css':
        key = 'cssCheckFunction';
        break;
      default:
    }
    if (tab === 'css') body[key] = code;
    else body[key] = JSON.parse(code);
    props.updateGraphicType({ graphicTypeId: graphicType.graphicTypeId, body });
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.titleContainer}>
        <Typography
          variant="button"
          color="secondary"
          className={classes.title}>
          {t(`graphic_type_check_function.title_${tab}`)}
        </Typography>
      </div>
      <Editor
        className={classes.editor}
        value={code}
        onChange={setCode}
        language="javascript"
      />
      {isEditor ? (
        <div className={classes.actions}>
          <Button
            startIcon={<SaveIcon />}
            fullWidth
            color="secondary"
            onClick={handleSave}
            disabled={props.updating}
            variant="outlined">
            {t('graphic_type_check_function.save')}
          </Button>
        </div>
      ) : null}
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
  updating: state.loading.effects.graphicType.updateGraphicType,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  updateGraphicType: dispatch.graphicType.updateGraphicType,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(CheckFunctionEditor);
