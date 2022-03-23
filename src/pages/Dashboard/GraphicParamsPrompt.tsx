import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { InputBase, Modal, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../components/Button';

const useStyles = makeStyles({
  modal: {
    position: 'absolute',
    width: 483,
    borderRadius: 10,
    backgroundColor: 'white',
    // boxShadow: theme.shadows[5],
    top: '50%',
    left: '50%',
    marginLeft: -200,
    marginTop: -200,
    padding: 35,
  },
  title: {
    fontSize: 20,
    flexGrow: 1,
    display: 'flex',
    fontFamily: '"Playfair Display", serif',
  },
  header: {
    width: '100%',
    display: 'flex',
    marginBottom: 33,
  },
  closeIcon: {
    cursor: 'pointer',
  },
  input: {
    height: 50,
    border: '1px solid #e2e2e2',
    borderRadius: 4,
    marginBottom: 15,
    padding: '17px 20px',
    fontSize: 14,
    fontWeight: 300,
  },
  submit: {
    width: 133,
    fontSize: 14,
    textTransform: 'none',
    cursor: 'pointer',
    '&[disabled]': {
      backgroundColor: 'lightgray',
    },
  },
});

interface Props {
  open: boolean;
  header: string;
  nameHint: string;
  idHint: string;
  submitLabel: string;
  name: string;
  id: string;
  onClose(): void;
  onSubmit(id: string, name: string): void;
}

const validIdRegex = /^[a-z0-9_-]+$/;

const GraphicNameIdPrompt: React.FC<Props> = (props) => {
  const classes = useStyles();

  const [name, setName] = useState(props.name);
  const [id, setId] = useState(props.id);
  const [inputIsValid, setInputIsValid] = useState(false);

  useEffect(() => setName(props.name), [props.name]);
  useEffect(() => setId(props.id), [props.id]);
  useEffect(() => {
    setInputIsValid(name?.length > 0 && validIdRegex.test(id));
  }, [name, id]);

  const handleSubmit = () => {
    props.onSubmit(id, name);
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <Typography variant="h2" className={classes.title}>
            {props.header}
          </Typography>
          <CloseIcon className={classes.closeIcon} onClick={props.onClose} />
        </div>
        <div>
          <InputBase
            fullWidth
            className={classes.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={props.nameHint}
          />
        </div>
        <div>
          <InputBase
            fullWidth
            className={classes.input}
            placeholder={props.idHint}
            value={id}
            onChange={(e) => setId(e.target.value.trim().toLowerCase())}
          />
        </div>
        <div>
          <Button
            className={classes.submit}
            disabled={!inputIsValid}
            variant="contained"
            color="primary"
            onClick={handleSubmit}>
            {props.submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GraphicNameIdPrompt;
