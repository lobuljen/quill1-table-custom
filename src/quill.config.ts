// // let  Quill = require('quill/dist/quill');
// let Quill = require('quill');
// const quillTable = require('quill-table');


// import {DocAttr} from '../site/app/common/quillDocAttributeSelector';
// import { RangeStatic } from 'quill';
// // import {ImageResize} from 'quill-image-resize-module';
// // import {ImageDrop} from 'quill-image-drop-module'
// // let ImageResize = require('quill-image-resize-module/image-resize.min.js');

// export default quillConfig;

// /** @ngInject */
// function quillConfig(ngQuillConfigProvider: any) {
//   //console.log("Quill config");  

//   Quill.register(quillTable.TableCell);
//   Quill.register(quillTable.TableRow);
//   Quill.register(quillTable.Table);
//   Quill.register(quillTable.Contain);
//   Quill.register('modules/table', quillTable.TableModule);

//   // Add fonts to whitelist
//   var Font = Quill.import('formats/font');
// // We do not add Aref Ruqaa since it is the default
//   //Font.whitelist = ['mirza', 'roboto'];
//   Quill.register(Font, true);

//   var Size = Quill.import('attributors/style/size');
//   //Size.whitelist = ['8px', '10px', '12px', '14px', '16px', '18px'];
//   Quill.register(Size, true);


//   var Parchment = Quill.import('parchment');
//   var Block = Parchment.query('block');
//   Block.tagName = 'DIV';
// // or class NewBlock extends Block {}; NewBlock.tagName = 'DIV';
//   Quill.register(Block /* or NewBlock */, true);

//   // Quill.register('modules/imageResize', ImageResize);
//   // Quill.register('modules/imageDrop', ImageDrop)


//   const QuillVideo = Quill.import('formats/video')
//   const BlockEmbed = Quill.import('blots/block/embed')

//   const VIDEO_ATTRIBUTES = ['height', 'width']

// // provides a custom div wrapper around the default Video blot
//   class Video extends BlockEmbed {
//     static create (value) {
//       const iframeNode = QuillVideo.create(value)
//       const node = super.create()
//       node.appendChild(iframeNode)
//       return node
//     }

//     static formats (domNode) {
//       const iframe = domNode.getElementsByTagName('iframe')[0]
//       return VIDEO_ATTRIBUTES.reduce(function (formats, attribute) {
//         if (iframe.hasAttribute(attribute)) {
//           formats[attribute] = iframe.getAttribute(attribute)
//         }
//         return formats
//       }, {})
//     }

//     static value (domNode) {
//       return domNode.getElementsByTagName('iframe')[0].getAttribute('src')
//     }

//     format (name, value) {
//       if (VIDEO_ATTRIBUTES.indexOf(name) > -1) {
//         if (value) { this.domNode.setAttribute(name, value) }
//         else { this.domNode.removeAttribute(name) }
//       }
//       else { super.format(name, value) }
//     }
//   }

//   Video.blotName = 'video'
//   Video.className = 'ql-video-wrapper'
//   Video.tagName = 'DIV'

//   Quill.register(Video, true)

//   let toolbarOptions = [
//     ['bold', 'italic', 'underline', 'strike'],
//     [{'list': 'ordered'}, {'list': 'bullet'}],
//     [{'indent': '-1'}, {'indent': '+1'}],
//     [{'header': [1, 2, 3, 4, 5, 6, false]}],
//     [{'color': []}, {'background': []}],
//     [{'font': []}],
//     [{'align': []}],
//     ['link','video'],
//     ['clean'],
//     //['attr']
//     [{ 'attr': [] }],
//   ];

//   const nodeListToArray = (collection: NodeList) => {
//     const elementsIndex: number[] = []
//       for (let i = 0; i < collection.length; i++) {
//         elementsIndex.push(i)
//       }      
//     return elementsIndex.map(i => collection.item(i))    
//   }

//   const removeNodeChildren = (node: Node) => {
//     while (node.firstChild) {
//       node.removeChild(node.firstChild);
//     }
//   }

//   const keyboardHandler = (key: "backspace" | "delete", range: RangeStatic, keycontext: any) => {
//     //@ts-ignore
//     const quill = window.quill    
//     let format_start = quill.getFormat(range.index - 1);
//     let format_end = quill.getFormat(range.index + range.length);
//     // если событие не в ячейки, то передать стандартному обработчику
//     if (!format_start.td && !keycontext.format.td && !format_end.td) {
//       return true;
//     }
//     // если выделение у границы ячейки
//     if (range.length > 0) {
//       const selection = window.getSelection();
//       const alltext = selection.toString()
//       const cells = document.querySelectorAll(".ql-editor td");
//       // удалить содержимое тех ячеек, которые выделены
//       const resultCells = nodeListToArray(cells)
//         .filter(cell =>
//           selection.containsNode(cell, true)
//         );
//       // удаление не затрагивает ячейку
//       if (resultCells.length <= 1) return true
//       if (!format_end.td) {   
//         const divs = document.querySelectorAll(".ql-editor div"); 
//         const resultDivs = nodeListToArray(divs)
//           .filter(div =>
//             selection.containsNode(div, true)
//           );
//           resultDivs.forEach((div, i) => {
//             const text = div.textContent;
//             console.log(text, "*")
//             removeNodeChildren(div)
//           })
//       }
//       resultCells.forEach((cell, i) => {
//         const text = cell.textContent;
//         removeNodeChildren(cell)
//         if (i === 0 && keycontext.offset > 0) {
//           debugger
//           let newtext = document.createTextNode(text.substr(0, keycontext.offset))
//           cell.appendChild(newtext)
//         }
//         if (i === resultCells.length - 1) {
//           const arr = alltext.split("\n")
//           let newtext = document.createTextNode(text.substr(arr[arr.length - 1].length))
//           cell.appendChild(newtext)
//         }
//       });
//       // убрать выделение
//       if (resultCells[0].firstChild) {
//         window.getSelection().collapse(resultCells[0].firstChild, keycontext.offset);
//       } else {
//         window.getSelection().collapse(resultCells[0], 0);
//       }
//       return false;
//     }
//     // если удаляем не у границы ячейки, то передать стандартному обработчику
//     if (key === "backspace" && keycontext.offset > 0) {
//       return true;
//     }
//     let node = quill.selection.getNativeRange().start.node;
//     let blot = Parchment.find(node);
    
//     if (key === "delete" && keycontext.offset < (blot.text ? blot.text.length : 0)) {
//       return true;
//     }
//     // if (key === "delete" && keycontext.offset > 0) {
//     //   return true;
//     // }
//     const [prev] = quill.getLine(range.index - 1);
//     const [next] = quill.getLine(range.index + 1);
//     // если в ячейки несколько строк, то можно удалять стандартно
//     if (key === "backspace" && prev && prev.next) {
//       return true;
//     }
//     if (key === "delete" && next && next.prev) {
//       return true;
//     }
//   }

//     ngQuillConfigProvider.set({
//     placeholder: 'Напишите текст письма',
//     modules: {
//       toolbar: toolbarOptions,
//       table: true,
//       keyboard: {
//         bindings: {
//           backspace: {
//             key: "backspace",
//             handler: (range: RangeStatic, keycontext: any) => keyboardHandler("backspace", range, keycontext)
//           },
//           delete: {
//             key: "delete",
//             handler: (range: RangeStatic, keycontext: any) => keyboardHandler("delete", range, keycontext)
//           },
//         }
//       }
//       // imageDrop: true,
//       // imageResize: {
//       //   modules: ['Resize', 'DisplaySize', 'Toolbar']
//       // }
//     },
//     bounds: '.custom-dialog-content'
//   });
// }

// DocAttr.register();
