import React, { useRef, useCallback, useState, useEffect } from 'react'

// Components
import { Document, Page } from 'react-pdf'; // open source

// Libraries
import { connect } from 'react-redux';
import { useInView } from 'react-intersection-observer'

// Redux
import PropTypes from "prop-types";
import { setDocInfo } from '../../actions/docActions'

const LoadDoc = (props) => {

    // document
    const [numPages, setNumPages] = useState(0);
    const [pagesArray, setPagesArray] = useState([]);

    // page inview
    const ref = useRef()
    const [inViewRef, inView, entry] = useInView()
    const [oneSecondReached, setOneSecondReached] = useState(false);

    // pages
    const [pageLoaded, setPageLoaded] = useState(false);
    const [pageRendered, setPageRenderd] = useState(false);
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [fabricRendered, setFabricRendered] = useState(false);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);

    // Use `useCallback` so we don't recreate the function on each render - Could result in infinite loop
    const setRefs = useCallback(
        (node) => {
            // Ref's from useRef needs to have the node assigned to `current`
            ref.current = node
            // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
            inViewRef(node)
        },
        [inViewRef],
    )

    // timeout for the 1 second delay
    // this is for when a user scrolls down the document quickly enough 
    // that it is unneccary to render the pages
    useEffect(() => {
        // clear the timeout so when the person leaves the pages before 1s
        if (entry) {
            entry.target.dataset.visible = inView;
            if (inView && !entry.target.firstChild) {
                setTimeout(() => {
                    if (entry.target.dataset.visible === 'true') {
                        setOneSecondReached(true)
                    }
                }, 1000)
            }
        }

        if (pageLoaded && pageRendered && !fabricRendered) {
            renderFabricCanvas()
            setFabricRendered(true)
        }
    });

    renderFabricCanvas = () => {
        let newPageDimensions = this.state.pageDimensions
        newPageDimensions[currentPageNum - 1] = { 'width': pageWidth,  'height': pageHeight}
        this.setState({ pageDimensions: newPageDimensions })

        // get the canvas element created by react-pdf
        const pageCanvasWrapperElement = document.getElementsByClassName(`react-pdf__Page ${currentPageNum}`)[0];
        const pageCanvasElement = pageCanvasWrapperElement.firstElementChild;
        pageCanvasElement.id = currentPageNum.toString()

        // browser
        // let browserElement = document.getElementById(`browser-${currentPageNum}`);
        // browserElement.style.backgroundImage = `url(${backgroundImg})`;

        // create fabric canvas element with correct dimensions of the document
        let fabricCanvas = new fabric.Canvas(currentPageNum.toString(), { width: Math.floor(pageWidth), height: Math.floor(pageHeight), selection: false });
        // console.log(document.getElementById(currentPageNum.toString()))
        document.getElementById(currentPageNum.toString()).fabric = fabricCanvas;

        fabricCanvas.setZoom(this.state.currentZoom)
        fabricCanvas.setWidth(this.state.pageDimensions[currentPageNum - 1].pageWidth * this.state.currentZoom)
        fabricCanvas.setHeight(this.state.pageDimensions[currentPageNum - 1].pageHeight * this.state.currentZoom)


        // if you are joinging and existing room and there are signatures that were already placed
        props.socket.emit('getCurrentPageSignatures', currentPageNum, (currentPageSignaturesJSONList) => {
            // Array of JSON -> Array of FabricJS Objects
            fabric.util.enlivenObjects(currentPageSignaturesJSONList, function (signatureObjects) {
                // loop through the array
                signatureObjects.forEach(function (signatureObject) {
                    // add the signature to the page
                    document.getElementById(currentPageNum.toString()).fabric.add(signatureObject)
                })
            })
        })


        let self = this
        //triggered when mousing over canvas or object
        fabricCanvas.on('mouse:over', function (o) {
            //different conditions for different tools
            //o.target is null when mousing out of canvas
            if (o.target && self.state.mode !== 'select') {
                o.target.hoverCursor = fabricCanvas.defaultCursor;
            } else if (o.target) {
                o.target.hoverCursor = fabricCanvas.hoverCursor;
            }

            if (self.state.mode === 'freedraw') {
                fabricCanvas.isDrawingMode = true;
                fabricCanvas.freeDrawingBrush.width = parseInt(self.state.brushSize);
                let match = self.state.selectedColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
                fabricCanvas.freeDrawingBrush.color = `rgb(${match[1]}, ${match[2]}, ${match[3]}, ${self.state.opacity / 100})`;

            }
        });

        //triggered when mousing out of canvas or object
        fabricCanvas.on('mouse:out', function (o) {
            fabricCanvas.isDrawingMode = false;
        });

        //triggers when mouse is clicked down
        fabricCanvas.on('mouse:down', function (o) {
            var pointer = fabricCanvas.getPointer(o.e);
            //add rectangle if highlither tool is used
            if (self.state.mode === 'highlighter') {
                self.setState({
                    isDown: true,
                    origX: pointer.x,
                    origY: pointer.y
                }, () => {
                    let rect = new fabric.Rect({
                        id: nanoid(),
                        left: self.state.origX,
                        top: self.state.origY,
                        originX: 'left',
                        originY: 'top',
                        width: pointer.x - self.state.origX,
                        height: pointer.y - self.state.origY,
                        angle: 0,
                        opacity: self.state.highlighterOpacity / 100,
                        fill: self.state.highlighterFillColor,
                        stroke: self.state.highlighterBorderColor,
                        strokeWidth: parseInt(self.state.highlighterBorderThickness),
                        transparentCorners: false
                    });
                    let obj={owner: self.state.username};
                    rect.set('owner',obj);
                    self.setState({
                        rect: rect,
                        toSend: true
                    }, () => {
                        fabricCanvas.add(rect);

                    })
                });
            }
        });

        //triggers when mouse is moved on canvas
        fabricCanvas.on('mouse:move', function (o) {
            //trigger if left mouse button is pressed
            if (!self.state.isDown) return;
            var pointer = fabricCanvas.getPointer(o.e);
            //resize rectangle if highlighter is selected
            if (self.state.mode === 'highlighter') {
                if (self.state.origX > pointer.x) {
                    self.state.rect.set({ left: Math.abs(pointer.x) });
                }
                if (self.state.origY > pointer.y) {
                    self.state.rect.set({ top: Math.abs(pointer.y) });
                }

                self.state.rect.set({ width: Math.abs(self.state.origX - pointer.x) });
                self.state.rect.set({ height: Math.abs(self.state.origY - pointer.y) });
            }

            fabricCanvas.renderAll();
        });

        //triggers when left mouse button is released
        fabricCanvas.on('mouse:up', function (e) {
            var pointer = fabricCanvas.getPointer(e.e);
            self.setState({ isDown: false });

            if (self.state.mode === 'highlighter') {
                self.state.rect.setCoords();
                const modifiedSignatureObject = self.state.rect;
                const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

                let pageData = {
                    pageNum: currentPageNum,
                    modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
                }

                props.socket.emit('editIn', pageData)
            } else if (self.state.mode === 'freedraw') {
                fabricCanvas.isDrawingMode = false;
            } else if (self.state.mode === 'text') {
                self.setState({ toSend: true }, () => {
                    fabricCanvas.add(new fabric.IText('Insert Text', {
                        fontFamily: 'roboto',
                        fontSize: self.state.textFontSize,
                        fill: self.state.textColor,
                        opacity: self.state.textOpacity / 100,
                        left: pointer.x,
                        top: pointer.y,
                        id: nanoid()
                    }));
                    fabricCanvas.renderAll();
                })

                self.setState({ mode: 'select' });
            }

            if (e.target) {
                e.target.lockScalingX = false
                e.target.lockScalingY = false
            }
            if (e.e.target.previousElementSibling !== null) {
                if (self.state.holding) {
                    self.addImage(fabricCanvas, self.state.signatureURL, e.pointer.x, e.pointer.y);
                    self.setState({
                        holding: false,
                        toSend: true
                    });
                }
            }
        });

        fabricCanvas.on('object:selected', function (e) {
            if (self.state.mode !== 'select') {
                fabricCanvas.discardActiveObject().renderAll();
            } else {
                self.setState({currentObjectOwner: e.target.get('owner').owner});
                if (self.state.username !== e.target.get('owner').owner) {
                    e.target.set({'borderColor':'#fbb802','cornerColor':'#fbb802'});
                }
            }


        });

        fabricCanvas.on('selection:updated', function (e) {
            if (self.state.mode !== 'select') {
                fabricCanvas.discardActiveObject().renderAll();
            } else {
                self.setState({currentObjectOwner: e.target.get('owner').owner});
                if (self.state.username !== e.target.get('owner').owner) {
                    e.target.set({'borderColor':'#fbb802','cornerColor':'#fbb802'});
                }
            }


        });

        fabricCanvas.on('before:selection:cleared', function() {
            self.setState({currentObjectOwner: null});
        });

        fabricCanvas.on('object:added', function (e) {
            const newSignatureObject = e.target
            if (!e.target.get('owner')) {
                let obj={owner: self.state.username};
                newSignatureObject.set('owner',obj);
            }
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner'])))
            let pageData = {
                pageNum: currentPageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }
            if (self.state.toSend) {
                props.socket.emit('addIn', pageData)
                self.setState({ toSend: false });
            }
        });

        fabricCanvas.on('object:modified', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: currentPageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            props.socket.emit('editIn', pageData)
        });

        fabricCanvas.on('object:moving', function (e) {
            var obj = e.target;

            // if object is too big ignore
            if (obj.getScaledHeight() > obj.canvas.height || obj.getScaledWidth() > obj.canvas.width) {
                return;
            }
            obj.setCoords();
            // top-left  corner
            if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
                obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
                obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
            }
            // bot-right corner
            if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
                obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
                obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
            }
        });

        fabricCanvas.on('object:scaling', function (e) {
            var obj = e.target;
            obj.setCoords();

            if (obj.top < 0) {
                obj.lockScalingY = true
                obj.top = 0
            } else if (obj.top + obj.getScaledHeight() > obj.canvas.height) {
                obj.lockScalingY = true
                obj.scaleY = (obj.canvas.height - obj.top) / obj.height
            }

            if (obj.left < 0) {
                obj.lockScalingX = true
                obj.left = 0
            } else if (obj.left + obj.getScaledWidth() > obj.canvas.width) {
                obj.lockScalingX = true
                obj.scaleX = (obj.canvas.width - obj.left) / obj.width
            }
        })

        fabricCanvas.on('object:removed', function (e) {
            const removedSignatureObject = e.target
            const removedSignatureObjectJSON = JSON.parse(JSON.stringify(removedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: currentPageNum,
                removedSignatureObjectJSON: removedSignatureObjectJSON
            }

            if (self.state.toSend) {
                props.socket.emit("deleteIn", pageData)
                self.setState({ toSend: false });
            }

        });

        fabricCanvas.on('text:changed', function (e) {
            const modifiedSignatureObject = e.target
            const modifiedSignatureObjectJSON = JSON.parse(JSON.stringify(modifiedSignatureObject.toObject(['id', 'owner'])))

            let pageData = {
                pageNum: currentPageNum,
                modifiedSignatureObjectJSON: modifiedSignatureObjectJSON
            }

            props.socket.emit('editIn', pageData)
        });

        fabricCanvas.on("path:created", function (o) {
            o.path.id = nanoid();
            const newSignatureObject = o.path
            const newSignatureObjectJSON = JSON.parse(JSON.stringify(newSignatureObject.toObject(['id', 'owner'])))
            let pageData = {
                pageNum: currentPageNum,
                newSignatureObjectJSON: newSignatureObjectJSON
            }

            props.socket.emit('addIn', pageData);
            self.setState({ toSend: false });
        });

        fabricCanvas.on('selection:created', function (e) {
            for (let i = 1; i <= numPages; i++) {
                if (i === currentPageNum) {
                    continue;
                }
                let canvasObject = document.getElementById(i.toString())
                if (canvasObject) {
                    let fabricCanvasObject = canvasObject.fabric
                    fabricCanvasObject.discardActiveObject().renderAll();
                }
            }
        });
    }

    // procs when the document is successfully loaded by the Document component from react-pdf
    // retrieves the number of pdf pages and store it in state
    function onDocumentLoadSuccess(pdf) {

        const pagesArray = new Array.from(Array(pdf.numPages), (_, i) => i + 1) // [1, 2, ..., pdf.numPages]
        const dimensionArray = new Array(pdf.numPages)

        setNumPages(pdf.numPages)
        setPagesArray(pagesArray)
    }

    function onPageLoadSuccess(page) {
        setPageWidth(page.view[2])
        setPageHeight(page.view[3])
        setPageLoaded(true)
    }

    function onPageLoadSuccess(currentPageNum) {
        setPageRenderd(true)
        setCurrentPageNum(currentPageNum)
    }

    const documentLoader = <div style={{ height: '500px' }}>
        <div class="loader-wrapper">
            <span class="circle circle-1"></span>
            <span class="circle circle-2"></span>
            <span class="circle circle-3"></span>
            <span class="circle circle-4"></span>
            <span class="circle circle-5"></span>
            <span class="circle circle-6"></span>
        </div>
    </div>

    return (<Document
        file={props.document}
        onLoadSuccess={(pdf) => onDocumentLoadSuccess(pdf)}
        loading={documentLoader}
        >  
            {/* Render the pages of the PDF */}
            {pagesArray.map((pageNum, i) => {
                <div className='page-and-number-container' id={`container-${pageNum}`}>
                    {
                        (oneSecondReached) 
                            ? 
                        (<div className="father-of-two">
                            {/* PDF CANVAS */}
                            <Page 
                                scale={props.scale}
                                pageNumber={pageNum}
                                // renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={'lowest-canvas'}
                            />

                            {/* FABRIC CANVAS */}
                            <Page 
                                scale={1}
                                pageNumber={pageNum}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={pageNum.toString()}
                                onLoadSuccess={(page) => onPageLoadSuccess(page)}
                                onRenderSuccess={() => onPageRenderSuccess(pageNum)}
                            />
                        </div>) 
                            : 
                        <div className='page-wrapper' id={`wrapper-${pageNum}`} ref={setRefs} />
                    }
                    <p className='page-number'>{pageNum}</p>
                </div>
            })}

            {/* Object Label */}
            {
                this.state.currentObjectOwner 
                    ? 
                <div className='current-object-owner'>
                    {this.state.currentObjectOwner}
                </div> 
                    : 
                null
            }
    </Document>)
}

const mapStateToProps = state =>  ({
    
})

export default connect(null, { setDocInfo })(LoadDoc);