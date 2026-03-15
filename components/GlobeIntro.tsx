
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const GlobeIntro: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width;
    canvas.height = height;

    const projection = d3.geoOrthographic()
      .scale((Math.min(width, height) * 0.85) / 2) // Slightly larger scale for intro
      .translate([width / 2, height / 2])
      .precision(0.1);

    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule10();
    const sphere = { type: "Sphere" } as any;

    let land: any;
    let rotation = [0, -25]; // Tilted start
    let velocity = [0.012, 0.003]; // Slightly slower, majestic rotation
    let lastTime = 0;

    const render = () => {
      context.clearRect(0, 0, width, height);
      
      // Deep Space / Atmospheric Glow
      context.beginPath();
      path(sphere);
      context.fillStyle = '#050508';
      context.fill();

      // Grid Lines - Cyber styling (Green)
      context.beginPath();
      path(graticule);
      context.lineWidth = 0.4;
      context.strokeStyle = 'rgba(34, 197, 94, 0.15)';
      context.stroke();

      // Land - Glowing vector look (Green)
      if (land) {
        context.beginPath();
        path(land);
        context.fillStyle = 'rgba(34, 197, 94, 0.2)';
        context.fill();
        context.lineWidth = 1.2;
        context.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        context.stroke();
      }

      // Atmospheric Radial Gradient
      const grad = context.createRadialGradient(width/2, height/2, width/5, width/2, height/2, width/2);
      grad.addColorStop(0, 'rgba(34, 197, 94, 0)');
      grad.addColorStop(0.8, 'rgba(5, 5, 8, 0.3)');
      grad.addColorStop(1, 'rgba(5, 5, 8, 0.9)');
      context.beginPath();
      path(sphere);
      context.fillStyle = grad;
      context.fill();

      // Sharp edge glow
      context.beginPath();
      path(sphere);
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      context.stroke();
    };

    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      
      rotation[0] += velocity[0] * (dt || 16);
      rotation[1] += velocity[1] * (dt || 16);
      projection.rotate(rotation as [number, number]);
      
      render();
      requestAnimationFrame(animate);
    };

    d3.json('https://unpkg.com/world-atlas@1/world/110m.json').then((world: any) => {
      land = topojson.feature(world, world.objects.land);
      requestAnimationFrame(animate);
    });

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      canvas.width = w;
      canvas.height = h;
      projection.scale((Math.min(w, h) * 0.85) / 2).translate([w / 2, h / 2]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-1000">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default GlobeIntro;
