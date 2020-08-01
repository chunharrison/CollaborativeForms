import React, { useRef, useCallback, useState, useEffect } from 'react'

// Redux
import { connect } from 'react-redux';

import deleteImg from './delete.png';
import submitImg from './submit.png';

import {
    addComment,
    deleteHighlight,
} from '../../../actions/toolActions';

const Comment = (props) => {
    let highlights = props.highlightDict;
    const [input, toggleInput] = useState(true);
    const [content, setContent] = useState('');

    function handleComment(e) {
        let pageData = {pageNum: props.pageNum, id: props.id, values:highlights[props.pageNum][props.id][0], text:highlights[props.pageNum][props.id][1], comment: content}
        props.addComment({key: props.pageNum, id: props.id, values: highlights[props.pageNum][props.id][0], text: highlights[props.pageNum][props.id][1], comment: content}) 
        props.userSocket.emit('commentIn', pageData);
        toggleInput(true);
    }

    function handleDelete() {

        props.deleteHighlight({key: props.pageNum, id:props.id});
        props.userSocket.emit('commentDelete', {pageNum: props.pageNum, id: props.id});
    }

    function scrollToHighlight(e) {
        let element = document.getElementById(`${e.target.parentNode.parentNode.id.substring(6)}`);
        element.scrollIntoView();
        element.childNodes.forEach((child) => {
            child.classList.add('highlight-box-red');
            setTimeout(function(){ child.classList.remove('highlight-box-red'); }, 500);
    
        })
    }


    return (
        <div className='comment-card' id={`panel-${props.id}`} data-page-number={props.pageNum} style={{'height': `${input !== true ? '200px' : ''}`}}>
            <div className='panel-text-comment-container'>
                <p className='document-text' onClick={(e) => scrollToHighlight(e)}>{props.text}</p>
                {input ? <p className='comment-text' onClick={(e) => toggleInput(false)}>{props.comment === '' ? 'Add comment...' : props.comment}</p> :
                <div className='panel-comment-input-container' style={{'position': 'absolute'}}>
                    <textarea className='panel-comment-input' type="text" onChange={(e) => setContent(e.target.value)}/>
                    <button className='panel-comment-submit-button' onClick={(e) => handleComment(e)}>
                        <img src={submitImg}/>
                    </button>
                </div>}
            </div>
            <button className='panel-comment-delete-button' onClick={(e) => handleDelete()}>
                <img src={deleteImg}/>
            </button>
        </div>

    )
}

const mapStateToProps = state => ({
    highlightDict: state.tool.highlightDict,

    userSocket: state.room.userSocket,
})

export default connect(mapStateToProps, {
    addComment,
    deleteHighlight,
})(Comment);