import React, { useRef, useCallback, useState, useEffect } from 'react'

import Comment from './Comment/Comment';

// Redux
import { connect } from 'react-redux';

import {
    addComment,
} from '../../actions/toolActions';

const CommentsPanel = (props) => {

    let highlights = props.highlightDict;

    return (
        <div className='comments-panel'>
            {typeof highlights === 'undefined' ? 
            null 
            :
            Object.keys(highlights).map((pageNum) =>
                    Object.keys(highlights[pageNum]).map((id) => 
                        <Comment
                        id={id}
                        pageNum={pageNum}
                        text={highlights[pageNum][id][1]}
                        comment={highlights[pageNum][id][2]}
                        />
                    )
            )}  
        </div>
    )
}

const mapStateToProps = state => ({
    highlightDict: state.tool.highlightDict,

    userSocket: state.room.userSocket,
})

export default connect(mapStateToProps, {
    addComment,
})(CommentsPanel);