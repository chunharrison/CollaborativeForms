import React, {useState, useEffect, useRef} from 'react';

//components
import DocumentCard from '../DocumentCard/DocumentCard'
import CreateDocument from '../CreateDocument/CreateDocument';


//Libraries
import { connect } from 'react-redux';
import axios from 'axios';

const InfiniteDocumentScroll = props => {
    const ref = useRef(null);
    const [documentNumber, setDocumentNumber] = useState([]);
    const [renderedCount, setRenderedCount] = useState(1);

    useEffect(() => {
        getDocumentIds();
    }, []);

    useEffect(() => {
        window.addEventListener('resize', resizeNotify, false);
        return () => {
            window.removeEventListener('resize', resizeNotify, false);
          };
    })

    useEffect(() => {
        if (!props.infiniteMode) {
            setRenderedCount(Math.floor(ref.current.clientWidth / 254) - 1);
        }
    }, [props.infiniteMode]);

    function resizeNotify() {
        if (!props.infiniteMode) {
            setRenderedCount(Math.floor(ref.current.clientWidth / 254) - 1);
        }
    }

    async function getDocumentIds() {
        const getDocumentIdUrl = `${process.env.REACT_APP_BACKEND_ADDRESS}/api/get-owners-documents`;

        let options = {
            params: {
                owner: props.auth.user.id,
            }
        };
        let res = await axios.get(getDocumentIdUrl, options);
        console.log(res.data);
        setDocumentNumber(res.data);
    }

    function removeCard() {
        getDocumentIds();
       
    }

    let documents = documentNumber.slice(0,renderedCount).map((data, index) =>
        <DocumentCard
        removeCard={removeCard}
        setRenderedCount= {setRenderedCount}
        renderedCount = {renderedCount}
        infiniteMode = {props.infiniteMode}
        documentCode = {data.roomCode}
        fileName = {data.fileName}
        userId = {props.auth.user.id}
        id = {index}
        />
    )

    return (
        <div ref={ref} className={`documents-shared-files ${props.infiniteMode ? 'expanded' : ''}`}>
            <CreateDocument/>
            {documents}
        </div>
    )

}

const mapStateToProps = state => ({
    auth: state.auth    
});

export default connect(mapStateToProps,

)(InfiniteDocumentScroll);