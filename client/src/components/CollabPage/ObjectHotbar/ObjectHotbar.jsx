import React, { useState, useEffect } from 'react' 
import { connect } from 'react-redux'

import { setHotbarObject } from '../../../actions/toolActions';

import './ObjectHotbar.css';

import binImg from './bin.png'

const ObjectHotbar = (props) => {
    
    const [objectX, setObjectX] = useState(0);
    const [objectY, setObjectY] = useState(0);

    useEffect(() => {
        if (props.hotbarObject !== null) { 
            setObjectX((props.hotbarObject.left * props.currentZoom + props.hotbarObject.width * props.currentZoom / 2 - 20) + props.currentCanvas._offset.left);
            setObjectY((props.hotbarObject.top * props.currentZoom + props.hotbarObject.height * props.currentZoom / 2 + 50 * props.currentZoom) + props.currentCanvas._offset.top);
        } else {
            setObjectX(null);
            setObjectY(null);
        }

        if (document.getElementById('canvas-container') !== null && props.hotbarObject !== null) {
            window.addEventListener("resize", (evt) => {
                props.setHotbarObject(null);
            }, { capture: false, passive: true})
            document.getElementById('canvas-container').addEventListener('scroll', (evt) => {
                props.setHotbarObject(null);
            }, { capture: false, passive: true})
    
        }

        return () => {
            if (document.getElementById('canvas-container') !== null) {
                window.removeEventListener("resize", (evt) => {
                    props.setHotbarObject(null);
                }, { capture: false, passive: true})
                document.getElementById('canvas-container').removeEventListener('scroll', (evt) => {
                    setHotbarObject(null);
                }, { capture: false, passive: true})
            }
        };
    }, [props.hotbarObject, props.currentZoom])

    return (
        <div className='hotbar' style={{'display': `${props.hotbarObject === null ? 'none' : ''}`, 'top': objectY, 'left': objectX}}>
            <button className='hotbar-delete' onClick={() => props.deleteObject(props.hotbarObject)}>
                <img src={binImg} alt=""/>
            </button>
        </div>
    )
}

const mapStateToProps = state => ({
    hotbarObject: state.tool.hotbarObject,
    currentZoom: state.tool.currentZoom,

});

export default connect(mapStateToProps, {
    setHotbarObject
})(ObjectHotbar)