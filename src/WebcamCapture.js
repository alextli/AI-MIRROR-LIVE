import { Buffer } from 'buffer';
import React, {useState, useEffect} from 'react';
import Webcam from 'react-webcam';
import * as fal from "@fal-ai/serverless-client";
global.Buffer = Buffer;
function WebcamCapture({prompt}) {
  const webcamRef = React.useRef(null);
  const [image, setImage] = useState(null);
  fal.config({
    // Can also be auto-configured using environment variables:
    // Either a single FAL_KEY or a combination of FAL_KEY_ID and FAL_KEY_SECRET
    credentials: `af4af4e0-e341-46f3-b081-e8ab5982a7d5:ada4b0d3223b304b8136c7c925101289`,
  });
  const connection = fal.realtime.connect("110602490-lcm-sd15-i2i", {
    clientonly:false,
    throttleInterval:0,
    connectionKey: 'camera-turbo-demo',
    onError: (error) => {
      console.error(error)
    },
    onResult: (result) => {
      if(result.images && result.images[0]){
        setImage(result.images[0].url);
      }
    }
  });
  useEffect(() => {
    const intervalId = setInterval(() => {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 512, // Lower resolution
        height: 512,
      });      
      connection.send({
        image_url: imageSrc,
        prompt: prompt.current,
        strength: 0.6,
        guidance_scale: 1,
        seed: 1000,
        num_inference_steps: 2,
        sync_mode: 1,
        negative_prompt: "deformed, ugly, blurry, low resolution",
        enable_safety_checks: false,
      });
    }, 150); // Changed to 1000 for 1 second interval
    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [connection, prompt]); // Removed image from dependency array
  
  return(
    <div>
      <img 
        src = {image}
        className="mirrored-image"
        alt="tinted mirror" 
        style={{position: "absolute", top: "0", left: "0", width: "100vw", height: "100vh", objectFit: "cover", zIndex: 1}} 
      />
      <Webcam
        ref={webcamRef}  
        className="mirrored-image"
        forceScreenshotSourceSize
        videoConstraints={{width: 512, height: 512}} 
        screenshotFormat="image/jpeg"
        style={{position: "absolute", top: "0", right: "0", width: "200px", height: "150px", zIndex: 3}} /> 
    </div>
      );
    }
  export default WebcamCapture;