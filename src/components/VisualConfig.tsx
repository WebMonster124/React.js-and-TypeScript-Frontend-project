import React, { ReactNode, useState } from 'react';
import { RematchDispatch } from '@rematch/core';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CreatableSelect from 'react-select/creatable';
import { capitalCase } from 'capital-case';
import { useTranslation } from 'react-i18next';

import { RootState, RootModel } from '../redux';
import { Config, ConfigField, Graphic } from '../types';
import { mergeConfig, overwriteWithQuery } from '../utils/config';
import { useEditorCheck } from '../hooks/use-role-check';
import logger from '../utils/logger';
import Button from './Button';
import Switch from './Switch';

export const useStyles = makeStyles({
  root: {
    margin: 10,
    padding: 20,
    '& > div:last-child': {
      marginBottom: 0,
    },
  },
  row: {
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    margin: 0,
    flexGrow: 1,
  },
  visibilityToggle: {
    background: 'none',
    border: 'none',
    margin: 0,
    marginLeft: 16,
    padding: 0,
    cursor: 'pointer',
    width: 30,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    outline: 'none',
    // color: blue[500],
  },
  hidden: {
    opacity: 0.5,
  },
  actions: {
    display: 'flex',
    flexShrink: 1,
  },
  action: {
    padding: '0 8px',
    '&:first-child': {
      paddingLeft: 0,
    },
    '&:last-child': {
      paddingRight: 0,
    },
  },
});

interface Props extends StateProps, DispatchProps {
  graphic: Graphic;
  disabledSave?: boolean;
  config?: Config;
  configDefault?: Config;
  configQuery?: string;
  showHiddenFields?: boolean;
  handleChange?(config: Config): void;
}

const supportedTypes = ['boolean', 'string', 'number'];

const VisualConfig: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const isEditor = useEditorCheck(props.user, props.showAs);

  const { graphic } = props;

  const [config, setConfig] = useState(props.config || graphic.configOnline);

  const setProperty = (field: string, key: string, value: any) =>
    new Promise<Config>((resolve) => {
      setConfig((prevConfig) => {
        const newConfig = { ...prevConfig };
        if (typeof newConfig[field] !== 'object') {
          newConfig[field] = { value: newConfig[field] as any };
        }
        newConfig[field][key] = value;
        resolve(newConfig);
        return newConfig;
      });
    });

  const setValue = async (field: string, value: any, type: string) => {
    let newConfig = null as Config | null;
    if (value === '') {
      newConfig = await setProperty(field, 'value', null);
      newConfig = await setProperty(field, 'type', 'string');
    } else {
      newConfig = await setProperty(field, 'value', value);
      if (type && !config?.[field]?.type) {
        newConfig = await setProperty(field, 'type', type);
      }
    }
    props.handleChange?.(newConfig);
  };

  const setHidden = (field: string, hidden: boolean) => {
    setProperty(field, 'hidden', hidden);
  };

  const handleSave = () => {
    const data = {
      graphicId: graphic.graphicId,
      body: {
        configOnline: config,
      },
    } as Graphic;
    logger.info('GraphicEditor/ConfigVisualEditor/SaveHandler');
    logger.debug('Saving graphic', data);
    props
      .updateGraphic(data)
      .then(() => {
        logger.debug('Graphic were updated');
        enqueueSnackbar('Graphic updated', {
          variant: 'success',
        });
      })
      .catch((e: any) => {
        logger.error('Error while updating graphic', {
          graphic: graphic.graphicId,
          err: e,
        });
        enqueueSnackbar('Error updating graphic', {
          variant: 'error',
        });
      });
  };

  const renderField = (key: string, data: any): ReactNode => {
    const label = data && data.label ? data.label : capitalCase(key);
    switch (data.type) {
      case 'option':
        return (
          <TextField
            key={key}
            label={label}
            variant="outlined"
            fullWidth
            className={classes.input}
            onChange={(ev) => setValue(key, ev.target.value, 'option')}
            value={data.value}
            select>
            {(data.options || []).map((op: any) => (
              <MenuItem value={op.value} key={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </TextField>
        );
      case 'array':
        return (
          <CreatableSelect
            isMulti
            styles={{
              container: (styles: any) => ({
                ...styles,
                flexGrow: 1,
              }),
              control: (styles: any) => ({
                ...styles,
                '&::before': {
                  content: `"${label}"`,
                  background: 'white',
                  position: 'absolute',
                  zIndex: 1,
                  top: '-10px',
                  left: 8,
                  padding: '0 4px',
                  color: 'rgba(0, 0, 0, 0.54)',
                  fontSize: 12,
                  fontFamily: 'Rubik, sans-serif',
                  fontWeight: 400,
                },
              }),
              valueContainer: (styles: any) => ({
                ...styles,
                padding: '14px 12px',
              }),
            }}
            value={data.value?.map((v: any) => {
              const o = data.options?.find((o: any) => o.value === v);
              return { value: v, label: (o && o.label) || v };
            })}
            onChange={(newValue: any) => {
              setValue(
                key,
                newValue?.map((o: any) => o.value),
                'array'
              );
            }}
            options={data.options}
          />
        );
      case 'boolean':
        return (
          <Switch
            key={key}
            label={label}
            checked={data.value}
            className={classes.input}
            onChange={(ev) => setValue(key, ev.target.checked, 'boolean')}
          />
        );
      case 'string':
        return (
          <TextField
            key={key}
            label={label}
            variant="outlined"
            fullWidth
            className={classes.input}
            // onInput={(ev: any) => setValue(key, ev.target.value, 'string')}
            onChange={(ev) => setValue(key, ev.target.value, 'string')}
            value={data.value || ''}
          />
        );
      case 'number':
        return (
          <TextField
            key={key}
            label={label}
            type="number"
            variant="outlined"
            fullWidth
            className={classes.input}
            // onInput={(ev: any) => setValue(key, Number(ev.target.value), 'number')}
            onChange={(ev) => setValue(key, Number(ev.target.value), 'number')}
            value={data.value}
          />
        );
      default: {
        const dataType = typeof data;
        if (typeof data === 'object' && 'value' in data) {
          const valueType = 'options' in data ? 'option' : typeof data.value;
          if (valueType === 'option' || supportedTypes.includes(valueType)) {
            return renderField(key, {
              type: valueType,
              value: data.value,
              options: data.options,
            });
          }
        }
        if (supportedTypes.includes(dataType)) {
          return renderField(key, { type: dataType, value: data });
        }
        return (
          <TextField
            key={key}
            label={label + ` (Unsupported type: ${data.type || typeof data})`}
            variant="outlined"
            fullWidth
            className={classes.input}
            value={JSON.stringify(data.value)}
            disabled
          />
        );
      }
    }
  };

  const renderRow = (key: string, data: ConfigField) => (
    <div key={key} className={classes.row}>
      {renderField(key, data)}
      {props.showHiddenFields && (
        <button
          className={`${classes.visibilityToggle} ${
            data.hidden ? classes.hidden : ''
          }`}
          onClick={() => setHidden(key, !data.hidden)}>
          {data.hidden ? <VisibilityOff /> : <Visibility />}
        </button>
      )}
    </div>
  );

  const showField = (key: string, data: ConfigField) => {
    if (props.showHiddenFields) return true;
    return !data.hidden;
  };

  const mergedConfig = mergeConfig(props.configDefault, config);
  const overwrittenConfig = overwriteWithQuery(
    mergedConfig,
    props.configQuery?.toString() || ''
  );

  return (
    <Paper className={classes.root}>
      {Object.keys(overwrittenConfig)
        .filter((key) => showField(key, overwrittenConfig[key]))
        .map((key) => renderRow(key, overwrittenConfig[key]))}
      {props.disabledSave || !isEditor ? null : (
        <div className={classes.actions}>
          <div className={classes.action} style={{ width: '35%' }}>
            <Button
              disabled={props.updating || false}
              onClick={handleSave}
              fullWidth
              variant="contained"
              color="secondary">
              {t('visual_config.submit')}
            </Button>
          </div>
        </div>
      )}
    </Paper>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
  updating: state.loading.effects.graphic.updateGraphic,
});

const mapDispatch = (dispatch: RematchDispatch<RootModel>) => ({
  updateGraphic: dispatch.graphic.updateGraphic,
});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

export default connect(mapState, mapDispatch)(VisualConfig);
