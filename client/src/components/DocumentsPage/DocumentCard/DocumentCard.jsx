import React, {useState, useEffect, useRef} from 'react';
import {withRouter} from 'react-router-dom';

//Libraries
import { connect } from 'react-redux';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import useOnClickOutside from 'use-onclickoutside'

//images
import optionsImg from './options.png';
import deleteImg from './bin.png'

const DocumentCard = props => {

    const wrapperRef = useRef(null);
    const [placeholderImg, setPlaceholderImg] = useState('');
    const [edit, setEdit] = useState(false);
    useOnClickOutside(wrapperRef, handleClickOutside)

    const [ref, inView, entry] = useInView({
        threshold: 0.5,
    })

    useEffect(() => {
        getDocument();
        setEdit(false);
    }, [props.documentCode])


    useEffect(() => {
        if(inView && props.infiniteMode) {
            props.setRenderedCount(props.renderedCount + 1);
        }
    }, [inView, props.infiniteMode])

    function handleClickOutside(e) {
        if(e.target.classname !== 'documents-placeholder-options') {
            setEdit(false);
        }
    }

    function getDocument() {
        // request PDF
        const generateGetUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/generate-get-url`;
        const options = {
            params: {
                Key: `${props.documentCode}.jpeg`,
                ContentType: 'image/jpeg'
            },
            headers: {
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'image/jpeg',
            },
        };
        axios.get(generateGetUrl, options).then(res => {
            let getURL = res.data;
            //get the data with the url that was given, then turn the data into a blob, which is the representation of a file without a name. this can be fed to a pdf render
            fetch(getURL).then(response => {
                setPlaceholderImg(response.url)
            })
        });
    }

    function handleCardClick() {
        props.history.push({
            pathname: `/collab`,
            search: `?username=${props.auth.user.name}&roomCode=${props.documentCode}&action=create`,
            state: {id: props.auth.user.id},
        })
    }

    function toggleEdit(e) {
        e.stopPropagation();
        setEdit(!edit);
    }

    function deleteDocument() {
        const deleteDocumentUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/delete-document`;
        axios.delete(deleteDocumentUrl, {
            data: {
              roomCode: props.documentCode
            }
          }).then(() =>{
              props.removeCard();
          });
    }

    return (
        <div className='documents-shared-file' ref={ref}>
            <div className='documents-shared-file-placeholder' style={{'backgroundImage': `url(${placeholderImg})`}} onClick={handleCardClick}>
                <img className='documents-placeholder-options' src={optionsImg} onClick={toggleEdit} ref={wrapperRef}/>
            </div>
            <div className={`documents-placeholder-popup ${edit ? 'fade-in' : ''}`} style={{'display': `${edit ? 'flex' : 'none'}`}} onClick={deleteDocument}>
                <img className='documents-placeholder-popup-option-img' src={deleteImg}/>
                <p className='documents-placeholder-popup-option'>Delete</p>
            </div>
        <p className='documents-shared-file-text'>{props.fileName.split(".")[0]}</p>
        </div>
    )

}

const mapStateToProps = state => ({
    auth: state.auth    
});

export default withRouter(connect(mapStateToProps)(DocumentCard))