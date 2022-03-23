import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import SaveIcon from '@material-ui/icons/Save';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
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
  tabs: {
    margin: 10,
  },
  editor: {
    margin: 10,
    marginTop: 0,
  },
  actions: {
    margin: 10,
    display: 'flex',
  },
  action: {
    flexShrink: 1,
    width: '50%',
  },
  sep: {
    width: 24,
  },
});

const StyledTab = withStyles(() => ({
  root: {
    textTransform: 'none',
    width: 120,
  },
}))((props: { label: string; value: string }) => (
  <Tab disableRipple {...props} />
));

interface Props extends StateProps, DispatchProps {
  tab: string;
  graphicType: GraphicType;
  checkFunctionVisible?: boolean;
  onChangeTab(tab: string): void;
}

const DefaultsEditor: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const isEditor = useEditorCheck(props.user, props.showAs);

  const { graphicType = {} as GraphicType } = props;
  let { tab } = props;

  useEffect(() => {
    if (props.checkFunctionVisible && tab === 'css') {
      props.onChangeTab('data');
    }
  }, [props.checkFunctionVisible, tab]);

  tab = tab === 'css' && props.checkFunctionVisible ? 'data' : tab;

  const [code, setCode] = useState('');

  const handleChange = (_: any, newValue: string) => {
    props.onChangeTab(newValue);
  };

  useEffect(() => {
    let code = '';
    if (graphicType) {
      switch (tab) {
        case 'data':
          code = JSON.stringify(graphicType.dataDefault, null, 4) || '';
          break;
        case 'descriptors':
          code = JSON.stringify(graphicType.descriptorsDefault, null, 4) || '';
          break;
        case 'config':
          code = JSON.stringify(graphicType.configDefault, null, 4) || '';
          break;
        case 'css':
          code = graphicType.cssDefault || '';
          break;
        default:
      }
    }
    setCode(code);
  }, [graphicType, tab]);

  const getLanguage = () => {
    switch (tab) {
      case 'data':
        return 'json';
      case 'descriptors':
        return 'json';
      case 'config':
        return 'json';
      case 'css':
        return 'css';
      default:
        return undefined;
    }
  };

  const handleSave = () => {
    let key = '';
    const body = {};
    switch (tab) {
      case 'data':
        key = 'dataDefault';
        break;
      case 'descriptors':
        key = 'descriptorsDefault';
        break;
      case 'config':
        key = 'configDefault';
        break;
      case 'css':
        key = 'cssDefault';
        break;
      default:
    }
    try {
      if (tab === 'css') body[key] = code;
      else body[key] = JSON.parse(code);
      props.updateGraphicType({
        graphicTypeId: graphicType.graphicTypeId,
        body,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        className={classes.tabs}
        value={tab}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="secondary">
        <StyledTab label={t('graphic_type_defaults.data')} value="data" />
        <StyledTab
          label={t('graphic_type_defaults.descriptors')}
          value="descriptors"
        />
        <StyledTab label={t('graphic_type_defaults.config')} value="config" />
        {props.checkFunctionVisible ? null : (
          <StyledTab label={t('graphic_type_defaults.css')} value="css" />
        )}
      </Tabs>
      <Editor
        className={classes.editor}
        value={code}
        onChange={setCode}
        language={getLanguage()}
      />
      <div className={classes.actions}>
        <div className={classes.action}>
          <Button
            disabled
            startIcon={<CheckCircleOutlineIcon />}
            fullWidth
            color="secondary"
            variant="contained">
            {t('graphic_type_defaults.check')}
          </Button>
        </div>
        <div className={classes.sep} />
        {isEditor ? (
          <div className={classes.action}>
            <Button
              startIcon={<SaveIcon />}
              fullWidth
              color="primary"
              onClick={handleSave}
              disabled={props.updating}
              variant="contained">
              {t('graphic_type_defaults.save')}
            </Button>
          </div>
        ) : null}
      </div>
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

export default connect(mapState, mapDispatch)(DefaultsEditor);
