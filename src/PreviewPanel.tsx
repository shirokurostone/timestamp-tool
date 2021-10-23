import React, { useState } from 'react';
import './PreviewPanel.css';

type TimestampNodeProps = {
　text: string,
  onClick: (text:string)=>void,
}
    
function TimestampNode(props: TimestampNodeProps){
  return (
    <a href="#" className="preview-timestamp-node link-primary" onClick={()=>props.onClick(props.text)}>{props.text}</a>
  );
}

type TextNodeProps = {
  text: string,
}
  
function TextNode(props: TextNodeProps){
  return (
    <span className="preview-text-node">{props.text}</span>
  );
}

type PreviewPanelProps = {
  onAddTimestamp: (text:string)=>void,
}

type NodeInfo = {
  text: string,
  type: 'text' | 'timestamp',
}

function parse(inputs: NodeInfo[], regex: RegExp) : NodeInfo[]{

  return inputs.flatMap(input=>{
    if (input.type !== 'text'){
      return [input];
    }
    const result : NodeInfo[] = [];
    const re = new RegExp(regex, 'g');
    let lastIndex = 0;
    let match;
    while ((match = re.exec(input.text)) !== null){
      if (match.index !== 0){
        result.push({
          text: input.text.slice(lastIndex, match.index),
          type: 'text',
        });
      }
      result.push({
        text: input.text.slice(match.index, match.index+match[0].length),
        type: 'timestamp',
      });

      lastIndex = re.lastIndex;
    }
    if (lastIndex !== input.text.length){
      result.push({
        text: input.text.slice(lastIndex),
        type: 'text',
      })
    }
    return result;
  });

}

function PreviewPanel(props: PreviewPanelProps){
  const [inputText, setInputText] = useState("");

  const regexps = [
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} ((\+|-)\d{4}|Z)/, //RFC2822
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{2}:\d{2}:\d{2} \d{4} (\+|-)\d{4}/,
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}(\+|-)\d{2}:?\d{2}/,
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\+|-)\d{2}:?\d{2}/,
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/,
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    /\d{4}-\d{2}-\d{2}/,
    /\d{12,13}/,
    /\d{9,10}/,
  ];

  const nodes = inputText.split("\n").flatMap(s=>{
    let nodes:NodeInfo[] = [{text: s, type: 'text'}];

    for (const regexp of regexps){
      nodes = parse(nodes, regexp);
    }

    let result = nodes.map(n=>{
      switch (n.type){
        case 'text':
          return (
            <TextNode text={n.text}/>
          );
        case 'timestamp':
          return (
            <TimestampNode text={n.text} onClick={props.onAddTimestamp}/>
          );
      }
    });

    result.push((<br/>));
    return result;
  });

  return (
    <div className="card">
      <div className="card-body">
        <div className="row">
          <div className="col-6">
          <textarea
            className="form-control preview-textarea"
            rows={10}
            onChange={(e)=>{setInputText(e.target.value)}}
            value={inputText}
            />
          </div>
          <div className="col-6">
            <div className="preview-column">
              { nodes }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewPanel;