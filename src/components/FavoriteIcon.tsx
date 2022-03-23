import React from 'react';
import { orange } from '@material-ui/core/colors';
import StarIcon from '@material-ui/icons/Star';
import StarIconOutlined from '@material-ui/icons/StarBorderOutlined';

interface Props {
  isFavorite?: boolean;
  color?: string;
  fontSize?: number;
  inheritStyles?: boolean;
}

const FavoriteIcon: React.FC<Props> = ({
  isFavorite,
  color,
  fontSize,
  inheritStyles,
}) => {
  isFavorite = isFavorite || false;
  inheritStyles = inheritStyles || false;
  const styles = inheritStyles
    ? {}
    : { fontSize: fontSize || 18, color: color || orange[500] };
  if (isFavorite) {
    return <StarIcon style={styles} />;
  } else {
    return <StarIconOutlined style={styles} />;
  }
};

export default FavoriteIcon;
