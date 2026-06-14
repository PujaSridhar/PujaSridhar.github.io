import { useEffect } from 'react';

export function useAnimatedNetwork(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    const mouse = { x: undefined, y: undefined };
    let animationFrameId = 0;
    let nodes = [];
    let networkColor = '90, 96, 80';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000);

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1,
      }));
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const draw = () => {
      networkColor = getComputedStyle(document.documentElement).getPropertyValue('--network-rgb').trim() || '90, 96, 80';
      context.clearRect(0, 0, canvas.width, canvas.height);
      const interactionRadius = 150;

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) {
          node.vx *= -1;
        }

        if (node.y < 0 || node.y > canvas.height) {
          node.vy *= -1;
        }

        const mouseDistance =
          mouse.x === undefined ? Number.POSITIVE_INFINITY : Math.hypot(node.x - mouse.x, node.y - mouse.y);
        const opacity = Math.max(0, 1 - mouseDistance / interactionRadius);

        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${networkColor}, ${0.5 + opacity * 0.5})`;
        context.fill();
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 120) {
            const midpointX = (nodes[i].x + nodes[j].x) / 2;
            const midpointY = (nodes[i].y + nodes[j].y) / 2;
            const mouseDistance =
              mouse.x === undefined ? Number.POSITIVE_INFINITY : Math.hypot(midpointX - mouse.x, midpointY - mouse.y);
            const opacity = Math.max(0.1, 1 - mouseDistance / interactionRadius);

            context.beginPath();
            context.moveTo(nodes[i].x, nodes[i].y);
            context.lineTo(nodes[j].x, nodes[j].y);
            context.strokeStyle = `rgba(${networkColor}, ${(1 - dist / 120) * 0.5 * opacity})`;
            context.stroke();
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);
}
