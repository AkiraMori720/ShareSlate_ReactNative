import React from 'react';
import PropTypes from 'prop-types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

export const VectorIcon = React.memo(({ type, name, size, color, style }) => {
    switch (type){
        case 'MaterialCommunityIcons':
            return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
        case 'MaterialIcons':
            return <MaterialIcons name={name} size={size} color={color} style={style} />;
        case 'Ionicons':
            return <Ionicons name={name} size={size} color={color} style={style} />;
        case 'AntDesign':
            return <AntDesign name={name} size={size} color={color} style={style} />;
        case 'FontAwesome':
            return <FontAwesome name={name} size={size} color={color} style={style} />;
        default:
            return <FontAwesome5 name={name} size={size} color={color} style={style} />;
    }
});

VectorIcon.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    color: PropTypes.object
};
