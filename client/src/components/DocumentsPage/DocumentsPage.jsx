import React from 'react';

import { connect } from 'react-redux';

import accountsImg from './accounts.png';
import documentsImg from './documents.png';
import settingsImg from './settings.png';
import addImg from './add.png';

import './DocumentsPage.css';

const DocumentsPage = props => {
    

    return (
        <div className='documents-page'>
            <div className='documents-nav'>
                    <p className='documents-nav-name'>
                        Harr Chung
                        <div className='documents-nav-name-underline'></div>
                    </p>
                    <div className='documents-nav-button-container'>
                        <img className='documents-nav-button-img' src={accountsImg}/>
                        <p className='documents-nav-button'>ACCOUNT</p>
                    </div>
                    <div className='documents-nav-button-container documents-nav-active-button'>
                        <img className='documents-nav-button-img' src={documentsImg}/>
                        <p className='documents-nav-button'>DOCUMENTS</p>
                    </div>
                    <div className='documents-nav-button-container'>
                        <img className='documents-nav-button-img' src={settingsImg}/>
                        <p className='documents-nav-button'>SETTINGS</p>
                    </div>
            </div>
            <div className='documents-background'>
                <div className='documents-container'>
                    <div className='documents-shared'>
                        <p className='documents-shared-text'>Shared Documents</p>
                        <div className='documents-line-expand'>
                            <div className='documents-line'></div>
                            <div className='documents-expand-container'>
                                <div className='documents-expand-vertical'></div>
                                <div className='documents-expand-horizontal'></div>
                            </div>
                        </div>
                        <div className='documents-shared-files'>
                            <div className='documents-create-new'>
                                <div className='documents-create-new-button'>
                                    <img src={addImg}/>
                                </div>
                                <p className='documents-create-new-text'>Create New</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                        </div>
                    </div>
                    <div className='documents-recently-viewed'>
                        <p className='documents-recently-viewed-text'>Recently Viewed</p>
                        <div className='documents-line-expand'>
                            <div className='documents-line'></div>
                            <div className='documents-expand-container'>
                                <div className='documents-expand-vertical'></div>
                                <div className='documents-expand-horizontal'></div>
                            </div>
                        </div>
                        <div className='documents-shared-files'>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                            <div className='documents-shared-file'>
                                <div className='documents-shared-file-placeholder'>

                                </div>
                                <p className='documents-shared-file-text'>Harb Chun Industries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
        </div>
    );

}

const mapStateToProps = state => ({
})

export default connect(mapStateToProps, {
})(DocumentsPage);