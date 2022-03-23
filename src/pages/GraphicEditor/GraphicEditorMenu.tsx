import React, { useState } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { List, ListItem, ListItemText, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import Title from '../../components/Title';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '70px',
  },
  containerNested: {
    height: '70px',
    paddingLeft: theme.spacing(6),
  },
  title: {
    padding: 30,
  },
  listItem: {
    marginLeft: 20,
    fontSize: 15,
    fontFamily: 'Rubik',
  },
  listItemSecondary: {
    marginLeft: 5,
    fontSize: 14,
    color: '#b8b8b8',
    fontFamily: 'Rubik',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  subheader: {
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  itemtext: {
    fontSize: 14,
  },
  searchbutton: {
    border: '1px solid #80808038',
    borderRadius: 7,
    position: 'absolute',
    right: 30,
    top: 85,
  },
}));

const useMenu = (access: string[]) => {
  const { t } = useTranslation();
  const restricted = access?.length > 0;
  const dataAccess = !restricted || access.includes('data');
  const notesAccess = !restricted || access.includes('notes');
  const descriptorsAccess = !restricted || access.includes('descriptors');
  const cssAccess = !restricted || access.includes('css');
  const assetsAccess = !restricted || access.includes('assets');
  let configAccess = !restricted || access.includes('config');
  const configVisualAccess = configAccess || access.includes('configVisual');
  const configEditorAccess = configAccess || access.includes('configEditor');
  configAccess = configAccess || configVisualAccess || configEditorAccess;
  return [
    dataAccess && {
      id: 'data',
      name: t('graphic_version_editor.data'),
    },
    notesAccess && {
      id: 'note',
      name: t('graphic_version_editor.note'),
    },
    descriptorsAccess && {
      id: 'descriptors',
      name: t('graphic_version_editor.descriptors'),
    },
    cssAccess && {
      id: 'css',
      name: t('graphic_version_editor.css'),
      sub: [
        {
          id: 'css-v0',
          name: t('graphic_version_editor.css-v0'),
        },
      ],
    },
    configAccess && {
      id: 'config',
      name: t('graphic_version_editor.config'),
      sub: [
        configVisualAccess && {
          id: 'config-visual',
          name: t('graphic_version_editor.config-visual'),
        },
        configEditorAccess && {
          id: 'config-editor',
          name: t('graphic_version_editor.config-editor'),
        },
      ].filter(Boolean),
    },
    assetsAccess && {
      id: 'assets',
      name: t('graphic_version_editor.assets'),
    },
  ].filter(Boolean);
};

interface Props {
  editorAccess?: string[];
}

const GraphicEditorMenu: React.FC<Props> = ({ editorAccess }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const {
    params: { screen = 'data' },
  } = useRouteMatch<{ screen: string }>(`${url}/:screen?`);

  const menu = useMenu(editorAccess || []);
  const history = useHistory();

  const [open, setOpen] = useState({ css: true, config: true });

  return (
    <React.Fragment>
      <Title
        className={classes.title}
        title={t('graphic_version_editor.header')}
      />
      <List>
        {menu.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem
              style={
                item.id === screen
                  ? { backgroundColor: '#ffae63', color: 'white' }
                  : {}
              }
              onClick={() => {
                if (item.id === 'css' || item.id === 'config')
                  setOpen((o) => ({
                    ...o,
                    [item.id]: !o[item.id],
                  }));
                else history.replace(`${url}/${item.id}`, { fromIP3: true });
              }}
              selected={item.id === screen}
              button
              className={classNames(classes.container, 'graphic-menu-item')}>
              <ListItemText
                className={classes.listItem}
                primary={<p className={classes.itemtext}>{item.name}</p>}
              />
              {item.sub ? open ? <ExpandLess /> : <ExpandMore /> : null}
            </ListItem>
            {item.sub ? (
              <Collapse in={open[item.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.sub.map((sub) => (
                    <ListItem
                      key={sub.id}
                      button
                      className={classes.containerNested}
                      style={
                        sub.id === screen
                          ? { backgroundColor: '#ffae63', color: 'white' }
                          : {}
                      }
                      onClick={() => {
                        history.replace(`${url}/${sub.id}`, { fromIP3: true });
                      }}
                      selected={sub.id === screen}>
                      <ListItemText
                        primary={<p className={classes.itemtext}>{sub.name}</p>}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            ) : null}
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </React.Fragment>
  );
};

export default GraphicEditorMenu;
