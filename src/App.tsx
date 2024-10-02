import React, { useEffect, useState } from 'react';
import ImageEditor from './pages/ImageEditor'
import { requestGenerationDetail } from './helpers/request';
import { getUrlParam } from './helpers/util';
import './App.css';

window.__TRY_ON_CONTEXT__ = {
  userId: 'xxxxxxx'
};
const generationId = getUrlParam('generation_id') || 'ae67oxbu23';
// alert(generationId);
function App() {
  const [generationImageId] = useState<string>(generationId);
  const [generationImageUrl, setGenerationImageurl] = useState<string>('');
  const [sourceImageId, setSourceImageId] = useState<string>('');
  const [sourceImageUrl, setSourceImageUrl] = useState<string>('');
  useEffect(() => {
    requestGenerationDetail(generationImageId).then((generation) => {
      console.log('generation: ', generation);
      setGenerationImageurl(generation.generation_image_url);
      setSourceImageId(generation.real_clothing.id);
      setSourceImageUrl(generation.real_clothing.image_url);
    });
  }, [generationImageId]);
  return (
    <div className="App">
      {
        generationImageUrl ?
          <ImageEditor sourceImageId={sourceImageId} sourceImageUrl={sourceImageUrl}
            generationImageId={generationImageId} generationImageUrl={generationImageUrl}
          /> : <></>
      }
    </div>
  );
}


export default App;
