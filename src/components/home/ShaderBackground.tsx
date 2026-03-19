'use client'

import { useRef, useEffect } from 'react'

const VERT_SRC = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG_SRC = `
  precision mediump float;
  uniform vec2  u_res;
  uniform float u_t;
  uniform vec2  u_mouse;
  uniform float u_dark;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float t  = u_t * 0.10;
    vec2 m   = (u_mouse - 0.5) * 0.14;

    // Three slow-moving orbs with mouse parallax
    vec2 o1 = vec2(0.18 + 0.07*sin(t*0.71), 0.55 + 0.06*cos(t*0.53)) + m;
    vec2 o2 = vec2(0.78 + 0.06*cos(t*0.43), 0.35 + 0.08*sin(t*0.61)) - m;
    vec2 o3 = vec2(0.50 + 0.05*sin(t*0.87), 0.75 + 0.04*cos(t*0.79)) + m * 0.5;

    float r1 = exp(-13.0 * dot(uv - o1, uv - o1));
    float r2 = exp(-11.0 * dot(uv - o2, uv - o2));
    float r3 = exp(-16.0 * dot(uv - o3, uv - o3));
    float total = r1 + r2 + r3;

    vec3 c1 = vec3(0.976, 0.451, 0.086); // orange #f97316
    vec3 c2 = vec3(0.576, 0.200, 0.914); // purple #9333ea
    vec3 c3 = vec3(0.055, 0.647, 0.914); // sky    #0ea5e9

    vec3 blend = (total > 0.001)
      ? (c1 * r1 + c2 * r2 + c3 * r3) / total
      : vec3(0.5);

    vec3 lightBase = vec3(0.973, 0.976, 0.980);
    vec3 darkBase  = vec3(0.067, 0.110, 0.153);
    vec3 base = mix(lightBase, darkBase, u_dark);

    float alpha = clamp(total, 0.0, 1.0) * mix(0.10, 0.24, u_dark);
    gl_FragColor = vec4(mix(base, blend, alpha), 1.0);
  }
`

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (globalThis.window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = (canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!vs || !fs) return
    gl.shaderSource(vs, VERT_SRC)
    gl.compileShader(vs)
    gl.shaderSource(fs, FRAG_SRC)
    gl.compileShader(fs)
    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uT = gl.getUniformLocation(prog, 'u_t')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uDark = gl.getUniformLocation(prog, 'u_dark')

    let mx = 0.5,
      my = 0.5,
      raf = 0,
      paused = false
    const t0 = performance.now()

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = (e.clientX - r.left) / r.width
      my = 1 - (e.clientY - r.top) / r.height
    }
    const render = () => {
      if (!paused) {
        const dt = document.documentElement.classList.contains('dark') ? 1 : 0
        gl.uniform2f(uRes, canvas.width, canvas.height)
        gl.uniform1f(uT, (performance.now() - t0) / 1000)
        gl.uniform2f(uMouse, mx, my)
        gl.uniform1f(uDark, dt)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
      raf = requestAnimationFrame(render)
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        paused = !e.isIntersecting
      },
      { threshold: 0 }
    )
    obs.observe(canvas)
    resize()
    globalThis.window.addEventListener('resize', resize, { passive: true })
    globalThis.window.addEventListener('mousemove', onMouse, { passive: true })
    render()

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      globalThis.window.removeEventListener('resize', resize)
      globalThis.window.removeEventListener('mousemove', onMouse)
      const ext = gl.getExtension('WEBGL_lose_context')
      ext?.loseContext()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}
