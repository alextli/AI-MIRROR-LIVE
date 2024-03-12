import { Buffer } from 'buffer';
import React, {useState, useEffect, useRef} from 'react';
import Webcam from 'react-webcam';
import * as fal from "@fal-ai/serverless-client";

global.Buffer = Buffer;

function WebcamCapture() {
  const webcamRef = useRef(null);
  const prompt = useRef(""); // Initialize prompt ref with an empty string
  const [image, setImage] = useState(null);
  const [reset, setReset] = useState(false); // State to trigger reset

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        // Only update prompt if not in reset state
        if (!reset) {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          if (event.results[0].isFinal) {
            prompt.current = transcript;
            console.log("New prompt: ", prompt.current);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      recognition.start();

      return () => recognition.stop();
    } else {
      console.log("Speech recognition not supported in this browser.");
    }
  }, [reset]); // Re-initialize speech recognition when reset state changes

  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        prompt.current = ""; // Reset the prompt
        setReset(true); // Indicate reset state
        setTimeout(() => setReset(false), 100); // Briefly set reset to true to re-initialize speech recognition
        console.log("Prompt reset.");
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  fal.config({
    // Can also be auto-configured using environment variables:
    // Either a single FAL_KEY or a combination of FAL_KEY_ID and FAL_KEY_SECRET
    credentials: `84bf17d7-ed75-4782-a608-a7a165cf59e2:af97d58be14f1cb3fb1ec0b5917edd83`,
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
      const imageSrc = webcamRef.current.getScreenshot();
      // console.log(imageSrc);
      connection.send({
        image_url: imageSrc,
        prompt: prompt.current,
        strength: 0.6,
        guidance_scale: 1,
        seed: 42,
        num_inference_steps: 3,
        sync_mode: 1,
        negative_prompt: "deformed, ugly, blurry, low resolution",
        enable_safety_checks: false,
      });
    }, 120); // Changed to 1000 for 1 second interval

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [prompt]); // Add prompt to the dependency array
  
  console.log(image)



  return(
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", backgroundColor: "white"}}>
      <img 
        src={image}
        className="mirrored-image"
        alt="tinted mirror" 
        style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1}} 
      />
      <Webcam
        ref={webcamRef}  
        className="mirrored-image"
        forceScreenshotSourceSize
        videoConstraints={{width: 512, height: 512}} 
        screenshotFormat="image/jpeg"
        style={{width: "15vh", height: "15vh", position: "absolute", top: 20, right: 40, zIndex: 2,
        border: '3px solid white', borderRadius: '10px', visibility:"hidden"}} 
      />
      <div style={{position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)", zIndex: 2, fontSize: "20px",}}>
        {prompt.current}
      </div>
    </div>
  );
}

export default WebcamCapture;


