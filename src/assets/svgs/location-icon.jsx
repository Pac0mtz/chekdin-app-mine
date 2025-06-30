import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function LocationIcon(props) {
  return (
    <Svg
      fill="#fff"
      width="20px"
      height="20px"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      {...props}>
      <Path d="M16 2C9.929 2 5 6.929 5 13c0 2.778 1.654 6.081 3.699 9.019 2.939 4.224 6.613 7.707 6.613 7.707.386.365.99.365 1.376 0 0 0 3.674-3.483 6.613-7.707C25.346 19.081 27 15.778 27 13c0-6.071-4.929-11-11-11zm0 5.5a5.502 5.502 0 00-5.5 5.5c0 3.036 2.464 5.5 5.5 5.5s5.5-2.464 5.5-5.5-2.464-5.5-5.5-5.5zm0 2c1.932 0 3.5 1.568 3.5 3.5s-1.568 3.5-3.5 3.5a3.501 3.501 0 01-3.5-3.5c0-1.932 1.568-3.5 3.5-3.5z" />
    </Svg>
  );
}

export default LocationIcon;
