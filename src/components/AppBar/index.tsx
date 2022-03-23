import React, { useState } from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar as MuiAppBar,
  Button as MuiButton,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import DvrIcon from '@material-ui/icons/Dvr';
import FeedbackIcon from '@material-ui/icons/Feedback';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import {
  Switch as RouterSwitch,
  Route,
  Link as RouterLink,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import imgLogo from '../../assets/logo.png';
import logger from '../../utils/logger';
import { RootState } from '../../redux';
import { useSmallScreenCheck } from '../../hooks/use-small-screen-check';
import {
  useAdminCheck,
  useEditorCheck,
  useTesterCheck,
} from '../../hooks/use-role-check';
import { checkEditor, checkTester } from '../../utils/user';
import GraphicTypeTitle from './GraphicTypeTitle';
import GraphicVersionTitle from './GraphicVersionTitle';
import RequestGraphicDialog from './RequestGraphicDialog';
import Profile from '../Profile';
import ViewAsRole from '../ViewAsRole';

const useStyles = makeStyles((theme) => ({
  appbar: {
    background: 'white',
    color: 'black',
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {},
  logoContainer: {
    display: 'flex',
    width: 140,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  profile: {},
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  title: {
    flexGrow: 1,
  },
  appTabs: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
    },
  },
  tabs: {
    overflow: 'visible',
  },
  tab: {
    minWidth: 100,
    maxWidth: 130,
    flexGrow: 1,
    whiteSpace: 'nowrap',
  },
  requestGraphicOn: {
    margin: `0 ${theme.spacing(1)}px`,
  },
}));

function a11yProps(index) {
  return {
    id: `nav-tab-${index}`,
    'aria-controls': `nav-tabpanel-${index}`,
  };
}

interface Props extends StateProps {
  onStateChange(state: string): void;
}

const AppBar: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const hideLogo = useSmallScreenCheck(950);
  const isAdmin = useAdminCheck(props.user, props.showAs);
  const isEditor = useEditorCheck(props.user, props.showAs);
  const isTester = useTesterCheck(props.user, props.showAs);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const tabs = [
    {
      label: t('appbar.users'),
      path: '/users',
      icon: PersonOutlineIcon,
    },
    {
      label: t('appbar.feedback'),
      path: '/feedback',
      icon: FeedbackIcon,
    },
    {
      label: t('appbar.monitor'),
      path: '/monitor',
      icon: DvrIcon,
    },
  ].filter((tab) => {
    if (tab.path === '/monitor') return true;
    if (tab.path === '/feedback') return isTester;
    else return isAdmin;
  });

  const graphicTypeTabs = [
    {
      label: t('appbar.defaults'),
      path: 'defaults',
    },
    {
      label: t('appbar.check_functions'),
      path: 'check-functions',
    },
    {
      label: t('appbar.setup'),
      path: 'setup',
    },
  ];

  return (
    <>
      <MuiAppBar position="static" elevation={3} className={classes.appbar}>
        <Toolbar className={classes.toolbar}>
          <RouterSwitch>
            <Route // Dashboard
              exact
              path={[
                '/dashboard',
                '/dashboard/:graphicTypeId',
                '/dashboard/:graphicTypeId/:graphicId',
                '/users',
                '/feedback',
                '/monitor',
                // Old routes:
                '/app',
                '/app/users',
                '/app/feedback',
              ]}
              render={({ match: { url } }) => (
                <>
                  {hideLogo ? null : (
                    <RouterLink
                      to="/dashboard"
                      className={classes.logoContainer}>
                      <img src={imgLogo} alt="Logo" className={classes.logo} />
                    </RouterLink>
                  )}
                  <Tabs
                    indicatorColor="primary"
                    textColor="primary"
                    value={
                      (tabs.find((t) => t.path === url) || {}).path || false
                    }
                    className={classes.appTabs}>
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.path}
                        value={tab.path}
                        className={classes.tab}
                        component={RouterLink}
                        label={tab.label}
                        icon={React.createElement(tab.icon)}
                        to={{
                          pathname: tab.path,
                          state: { fromIP3: true },
                        }}
                      />
                    ))}
                  </Tabs>
                  <Tooltip title={t('request_graphic.button_hint')}>
                    <MuiButton
                      className={classes.requestGraphicOn}
                      variant="outlined"
                      size="small"
                      onClick={() => setRequestDialogOpen(true)}>
                      {t('request_graphic.button')}
                    </MuiButton>
                  </Tooltip>
                  {checkTester(props.user) ? <ViewAsRole /> : null}
                </>
              )}
            />
            <Route // Graphic Version Editor
              path={[
                '/edit/:graphicTypeId/g/:graphicId',
                '/edit/:graphicTypeId/graphic/:graphicId',
                '/app/:graphicTypeId/graphic/:graphicId',
              ]}
              render={({ match }) => {
                const {
                  params: { graphicTypeId, graphicId },
                } = match;
                return (
                  <>
                    <GraphicVersionTitle
                      graphicTypeId={graphicTypeId}
                      graphicId={graphicId}
                    />
                    {checkEditor(props.user) ? <ViewAsRole /> : null}
                  </>
                );
              }}></Route>
            <Route // Graphic Type Editor
              path={['/edit/:graphicTypeId', '/app/:graphicTypeId']}
              render={({
                match: {
                  url,
                  params: { graphicTypeId },
                },
              }) => (
                <>
                  <GraphicTypeTitle graphicTypeId={graphicTypeId} />
                  {isEditor ? (
                    <Tabs
                      className={classes.tabs}
                      value={
                        (graphicTypeTabs.find((t) => t.path === url) || {})
                          .path || false
                      }>
                      {graphicTypeTabs.map((link) => (
                        <Tab
                          key={link.path}
                          value={link.path}
                          className={classes.tab}
                          component={RouterLink}
                          label={link.label}
                          to={{
                            pathname: `${url}/${link.path}`,
                            state: { fromIP3: true },
                          }}
                          {...a11yProps(0)}
                        />
                      ))}
                    </Tabs>
                  ) : null}
                  {checkEditor(props.user) ? <ViewAsRole /> : null}
                </>
              )}></Route>
          </RouterSwitch>
          <Profile
            onLogout={() => {
              logger.debug('Changing auth state');
              props.onStateChange('signIn');
            }}
            className={classes.profile}
          />
        </Toolbar>
      </MuiAppBar>
      <RequestGraphicDialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
      />
    </>
  );
};

const mapState = (state: RootState) => ({
  user: state.auth,
  showAs: state.app.showAs,
});

type StateProps = ReturnType<typeof mapState>;

export default connect(mapState)(AppBar);
