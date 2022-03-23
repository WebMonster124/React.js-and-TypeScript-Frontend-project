import { Button as BaseButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const Button = withStyles(() => ({
  root: {
    height: 50,
    borderRadius: 5,
    fontFamily: 'Rubik',
    fontSize: 16,
    textTransform: 'none',
  },
  containedPrimary: {
    color: 'white',
  },
  startIcon: {},
  endIcon: {},
}))(BaseButton);

export default Button;
