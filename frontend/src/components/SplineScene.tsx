import { motion } from 'framer-motion';

interface SplineSceneProps {
  scene: string;
  className?: string;
  isIframe?: boolean;
}

export default function SplineScene({ 
  scene,
  className = "w-full h-full",
}: SplineSceneProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={className}
    >
      <iframe 
        src={scene}
        frameBorder="0"
        width="100%"
        height="100%"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        className="w-full h-full pointer-events-none"
      />
    </motion.div>
  );
}
