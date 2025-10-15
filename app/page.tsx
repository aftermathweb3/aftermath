"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

export default function Home() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const heroImgRef = useRef(null);
  const contextRef = useRef(null);
  const imagesRef = useRef([]);
  const videoFramesRef = useRef({ frame: 0 });
  const lenisRef = useRef(null);
  const scrollTriggerCreatedRef = useRef(false);
  
  // Portal modal state
  const [showPortalModal, setShowPortalModal] = useState(false);
  const { isConnected } = useAccount();

  gsap.registerPlugin(ScrollTrigger, useGSAP);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      contextRef.current = context;

      const setCanvasSize = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        context.scale(pixelRatio, pixelRatio);
      };

      setCanvasSize();

      const frameCount = 207;
      const currentFrame = (index) =>
        `/frames/frame_${(index + 1).toString().padStart(4, "0")}.jpg`;

      let images = [];
      let imagesToLoad = frameCount;

      const onLoad = () => {
        imagesToLoad--;
        console.log(`Images loaded: ${frameCount - imagesToLoad}/${frameCount}`);
        if (!imagesToLoad) {
          console.log("All images loaded, setting up animation");
          // Set initial frame to 1 and render immediately
          videoFramesRef.current.frame = 1;
          console.log("Rendering initial frame");
          render();
          console.log("Setting up scroll trigger");
          setupScrollTrigger();
          
          // Trigger fade-in effect
          setTimeout(() => {
            if (headerRef.current) {
              headerRef.current.classList.add('fade-in');
              console.log("Header fade-in effect triggered");
            }
            if (navRef.current) {
              navRef.current.classList.add('fade-in');
              console.log("Navigation fade-in effect triggered");
            }
            if (canvasRef.current) {
              canvasRef.current.classList.add('fade-in');
              console.log("Canvas fade-in effect triggered");
            }
          }, 1000);
        }
      };

      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = onLoad;
        img.onerror = function () {
          onLoad.call(this);
        };
        img.src = currentFrame(i);
        images.push(img);
        
        // Preload first frame with higher priority
        if (i === 0) {
          img.loading = 'eager';
        }
      }

      imagesRef.current = images;

      // Initial render to show first frame immediately
      const initialRender = () => {
        console.log("Initial render attempt");
        if (images.length > 0 && images[0].complete) {
          videoFramesRef.current.frame = 1;
          console.log("Initial render - first image ready, rendering frame 1");
          render();
        } else {
          console.log("Initial render - first image not ready, retrying");
          // Try again after a short delay
          setTimeout(initialRender, 200);
        }
      };
      
      // Try to render immediately if first image is already loaded
      setTimeout(initialRender, 100);

      const render = () => {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const img = images[videoFramesRef.current.frame];
        console.log(`Rendering frame ${videoFramesRef.current.frame}, image complete: ${img?.complete}, naturalWidth: ${img?.naturalWidth}`);
        
        if (img && img.complete && img.naturalWidth > 0) {
          const imageAspect = img.naturalWidth / img.naturalHeight;
          const canvasAspect = canvasWidth / canvasHeight;

          let drawWidth, drawHeight, drawX, drawY;

          if (imageAspect > canvasAspect) {
            drawHeight = canvasHeight;
            drawWidth = drawHeight * imageAspect;
            drawX = (canvasWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = canvasWidth;
            drawHeight = drawWidth / imageAspect;
            drawX = 0;
            drawY = (canvasHeight - drawHeight) / 2;
          }

          context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          console.log("Image drawn successfully");
        } else {
          // Show a placeholder or background color if image isn't ready
          context.fillStyle = '#fefbf4';
          context.fillRect(0, 0, canvasWidth, canvasHeight);
          console.log("Drawing background color - image not ready");
        }
      };

      const setupScrollTrigger = () => {
        if (scrollTriggerCreatedRef.current) {
          console.log("Scroll trigger already created, skipping");
          return;
        }
        
        console.log("Creating scroll trigger");
        scrollTriggerCreatedRef.current = true;
        
        ScrollTrigger.create({
          trigger: ".hero",
          start: "top top",
          end: `+=${window.innerHeight * 7}px`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            console.log(`Scroll progress: ${progress.toFixed(3)}`);

            // Update canvas frame based on scroll progress
            const animationProgress = Math.min(progress / 0.9, 1);
            const targetFrame = Math.round(
              animationProgress * (frameCount - 1)
            );
            videoFramesRef.current.frame = targetFrame;
            render();

            // Only apply scroll animations after initial fade-in is complete
            const isInitialFadeIn = !headerRef.current?.classList.contains('fade-in');
            
            if (!isInitialFadeIn) {
              // Simple opacity changes based on scroll progress
              if (progress <= 0.1) {
                // Nav fades out in first 10% of scroll
                const navOpacity = 1 - (progress / 0.1);
                gsap.set(navRef.current, { opacity: navOpacity });
                console.log(`Nav opacity: ${navOpacity.toFixed(3)}`);
              } else {
                gsap.set(navRef.current, { opacity: 0 });
              }

              if (progress <= 0.25) {
                // Header moves back and fades out in first 25% of scroll
                const zProgress = progress / 0.25;
                const translateZ = zProgress * -500;
                const headerOpacity = progress >= 0.2 ? 1 - ((progress - 0.2) / 0.05) : 1;

                gsap.set(headerRef.current, {
                  transform: `translate(-50%, -40%) translateZ(${translateZ}px)`,
                  opacity: headerOpacity,
                });
                console.log(`Header opacity: ${headerOpacity.toFixed(3)}, translateZ: ${translateZ}`);
              } else {
                gsap.set(headerRef.current, { opacity: 0 });
              }
            }

            if (progress < 0.6) {
              // Hero image stays hidden until 60% scroll
              gsap.set(heroImgRef.current, {
                transform: "translateZ(1000px)",
                opacity: 0,
              });
            } else if (progress >= 0.6 && progress <= 0.9) {
              // Hero image animates in from 60% to 90% scroll
              const imgProgress = (progress - 0.6) / (0.9 - 0.6);
              const translateZ = 1000 - imgProgress * 1000;
              const imgOpacity = progress <= 0.8 ? (progress - 0.6) / 0.2 : 1;

              gsap.set(heroImgRef.current, {
                transform: `translateZ(${translateZ}px)`,
                opacity: imgOpacity,
              });
              console.log(`Hero image opacity: ${imgOpacity.toFixed(3)}, translateZ: ${translateZ}`);
            } else {
              // Hero image fully visible after 90% scroll
              gsap.set(heroImgRef.current, {
                transform: "translateZ(0px)",
                opacity: 1,
              });
            }
          },
        });
        console.log("Scroll trigger created");
      };

      const handleResize = () => {
        setCanvasSize();
        render();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <nav ref={navRef}>
        <div className="nav-links">
          <a href="#">Protocol</a>
          <a href="#">Security</a>
          <a href="#">Documentation</a>
        </div>
        <div className="logo">
          <a href="#">
            <img src="/logo.png" alt="" /> Aftermath
          </a>
        </div>
        <div className="nav-buttons">
    
        </div>
      </nav>

      <section className="hero">
        <canvas ref={canvasRef}></canvas>

        <div className="hero-content">
          <div className="header" ref={headerRef}>
            <h1>Crypto Inheritance Protocol</h1>
            <p>Securely pass your digital assets to family members</p>
            <div className="client-logos">
              <div className="client-logo">
                <img src="/client-logo-1.png" alt="" />
              </div>
              <div className="client-logo">
                <img src="/client-logo-2.png" alt="" />
              </div>
              <div className="client-logo">
                <img src="/client-logo-3.png" alt="" />
              </div>
              <div className="client-logo">
                <img src="/client-logo-4.png" alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-img-container">
          <div className="hero-img" ref={heroImgRef}>
            <img src="/dashboard.png" alt="" />
          </div>
        </div>
      </section>

      <section className="outro">
        <h1>Secure Your Family's Digital Legacy</h1>
        <div className="outro-buttons">
          <div className="btn primary" onClick={() => setShowPortalModal(true)} style={{cursor: 'pointer'}}>
            <span>Get Started</span>
          </div>
          <div className="btn secondary">
            <a href="#">Learn More</a>
          </div>
        </div>
      </section>

      {/* Portal Modal */}
      {showPortalModal && (
        <div className="portal-modal-overlay" onClick={() => setShowPortalModal(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="portal-modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '60px',
            maxWidth: '800px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            animation: 'modalFadeIn 0.3s ease-out'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowPortalModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Logo and Title */}
            <div className="portal-header" style={{
              marginBottom: '40px'
            }}>
              <div className="logo" style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>
                ⚡
              </div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '12px'
              }}>
                Aftermath Protocol
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#666',
                marginBottom: '0'
              }}>
                Secure Crypto Inheritance Management
              </p>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="connection-section" style={{
                marginBottom: '40px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  color: '#333',
                  marginBottom: '16px'
                }}>
                  Connect Your Wallet to Continue
                </h3>
                <ConnectButton />
              </div>
            )}

            {/* Main Options */}
            {isConnected && (
              <div className="portal-options" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '40px'
              }}>
                {/* Create Inheritance Option */}
                <div 
                  className="option-card create-inheritance"
                  onClick={() => window.location.href = '/dashboard'}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div className="option-icon" style={{
                    fontSize: '64px',
                    marginBottom: '20px'
                  }}>
                    🏗️
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>
                    Create Inheritance
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    Set up inheritance rules for your crypto assets and manage family beneficiaries
                  </p>
                  <div className="option-features" style={{
                    textAlign: 'left'
                  }}>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      Asset Management
                    </div>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      Family Setup
                    </div>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      Inheritance Rules
                    </div>
                  </div>
                </div>

                {/* Claim Inheritance Option */}
                <div 
                  className="option-card claim-inheritance"
                  onClick={() => window.location.href = '/dashboard2'}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '16px',
                    padding: '40px 30px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fff',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#764ba2';
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(118, 75, 162, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div className="option-icon" style={{
                    fontSize: '64px',
                    marginBottom: '20px'
                  }}>
                    🎁
                  </div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
                  }}>
                    Claim Inheritance
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    Access and claim crypto assets that have been inherited to you
                  </p>
                  <div className="option-features" style={{
                    textAlign: 'left'
                  }}>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      View Inheritances
                    </div>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      Claim Assets
                    </div>
                    <div className="feature" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      <span style={{marginRight: '8px'}}>✓</span>
                      Verify Identity
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="portal-footer" style={{
              paddingTop: '30px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#888',
                marginBottom: '0'
              }}>
                Secure • Decentralized • Family-First
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}