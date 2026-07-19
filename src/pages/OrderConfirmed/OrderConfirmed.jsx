import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HelpCircle, Truck, ArrowRight, Check } from 'lucide-react';

const OrderConfirmed = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const canvasRef = useRef(null);

  const displayCustomerName = auth.user?.name ? auth.user.name.split(' ')[0] : "Alexander";

  // Confetti Particle Animation Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = ['#fed488', '#e5e2e1', '#5f5e5e', '#000000'][Math.floor(Math.random() * 4)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        if (canvas) particles.push(new Particle());
      }, i * 30);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].y > canvas.height) {
          particles.splice(i, 1);
          i--;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleTrackOrder = () => {
    alert("Retrieving real-time dispatch updates for SN-2849104...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Canvas for Confetti */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      <main className="flex-grow pt-24 pb-xl px-margin-mobile md:px-gutter max-w-container-max mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
          
          {/* Left Column: Success Checkmark & Timeline */}
          <div className="lg:col-span-7 space-y-lg">
            {/* Header Success info */}
            <section className="space-y-md text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-md">
                <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
                  <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline className="success-checkmark" points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] mb-xs">
                    Order Confirmed
                  </p>
                  <h1 className="font-display-lg text-display-lg-mobile md:text-headline-md text-primary font-bold">
                    Thank You for your purchase, {displayCustomerName}.
                  </h1>
                </div>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Your order <span className="font-bold text-primary">#SN-2849104</span> has been placed successfully. We've sent a confirmation email to your registered email address with all the tracking details.
              </p>
            </section>

            {/* Estimated Delivery timeline */}
            <section className="bg-surface-container-low p-md md:p-lg rounded-xl space-y-md border border-outline-variant/10">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-primary">Estimated Delivery</h2>
                <Truck className="text-primary" size={20} />
              </div>
              
              <div className="relative pt-base">
                {/* Horizontal Progress Bar */}
                <div className="absolute top-[37px] left-0 w-full h-[2px] bg-outline-variant/30"></div>
                <div className="absolute top-[37px] left-0 w-1/3 h-[2px] bg-primary"></div>
                
                <div className="grid grid-cols-3 relative">
                  <div className="flex flex-col items-center gap-base">
                    <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10"></div>
                    <div className="text-center">
                      <p className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-wider">Confirmed</p>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-xs">Today</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-base">
                    <div className="w-4 h-4 rounded-full bg-outline-variant ring-4 ring-background z-10"></div>
                    <div className="text-center">
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Shipped</p>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-xs">Est. Oct 24</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-base">
                    <div className="w-4 h-4 rounded-full bg-outline-variant ring-4 ring-background z-10"></div>
                    <div className="text-center">
                      <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Delivered</p>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-xs">Est. Oct 27</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-md">
              <button
                onClick={handleTrackOrder}
                className="flex-1 bg-primary text-on-primary py-4 px-lg rounded-xl font-button text-button hover:opacity-90 transition-opacity flex items-center justify-center gap-base uppercase tracking-wider shadow-sm"
              >
                Track Order
                <ArrowRight size={16} />
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="flex-1 border border-primary text-primary py-4 px-lg rounded-xl font-button text-button hover:bg-surface-container-low transition-colors flex items-center justify-center gap-base uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Right Column: Order Confirmation Summary */}
          <div className="lg:col-span-5">
            <aside className="bg-white border border-outline-variant/30 rounded-xl p-md md:p-lg sticky top-24 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-md">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-md">Order Summary</h3>
              
              {/* Confirmed list */}
              <div className="space-y-md border-b border-outline-variant/30 pb-md mb-md">
                {/* Product 1 */}
                <div className="flex gap-md">
                  <div className="w-20 h-24 flex-shrink-0 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZjraL-gFp4zN0aDsb0XKMuLBOOXvOXtB564xK76bqU4CgLxw-ps4-HqG3I3iSa94aw7jCY-pQABAPxDdxG0hpZUcFL3amO2FWIEwaGb2RtZC8DCsGthruK3Ce7dF6KToR6L0-nslnGFayDZ0jkjvafIzLDXBXHLcjKbzaqBJeU8PmqJPh5Ke2NtkaPYLE0CX-r35ib7IRSrBjaBzHI25ZEio3-3EwUvyNn7D2FWC5Whtiu6HIQJab"
                      alt="Textured Wool Cardigan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="font-body-md text-body-md font-bold text-primary">Textured Wool Cardigan</h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">Size: Medium • Color: Charcoal</p>
                    <div className="flex justify-between items-end mt-base">
                      <span className="font-body-sm text-body-sm">Qty: 1</span>
                      <span className="font-body-md text-body-md font-bold text-primary">$185.00</span>
                    </div>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="flex gap-md">
                  <div className="w-20 h-24 flex-shrink-0 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX2iwOSKtz-enjMPrCVZmJ5-Rd2Olul1mSF6l8_VEb0UDOSlsmCYk9pM-lmNn0k74EkCuOXNW9yYbg5i38Ki42ykQNyb2Z_luaWaKmd5vy_NnPSu6r8AX8p_hv65Q6j2XEe_cWxQdihx5sjfhtr9dP3DrYsvYSJn0uKCLZ7exWbDixEklRkjGvphYVCnjvRBAPsdlwdtaMbpl6V04HgH-Xny4AFZOPfo7fYD1OBn1HdxXJD2NEmIu8"
                      alt="Amber & Suede Candle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <h4 className="font-body-md text-body-md font-bold text-primary">Amber & Suede Candle</h4>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">Size: 12oz • Limited Edition</p>
                    <div className="flex justify-between items-end mt-base">
                      <span className="font-body-sm text-body-sm">Qty: 2</span>
                      <span className="font-body-md text-body-md font-bold text-primary">$76.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price calculations */}
              <div className="space-y-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-sm text-body-sm">Subtotal</span>
                  <span className="font-body-sm text-body-sm text-primary font-semibold">$261.00</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-sm text-body-sm">Shipping (Express)</span>
                  <span className="font-body-sm text-body-sm text-primary font-semibold">$15.00</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span className="font-body-sm text-body-sm">Estimated Tax</span>
                  <span className="font-body-sm text-body-sm text-primary font-semibold">$22.40</span>
                </div>
                
                <div className="flex justify-between text-primary pt-base border-t border-outline-variant/30 mt-base">
                  <span className="font-body-md text-body-md font-bold">Total</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">$298.40</span>
                </div>
              </div>

              {/* Concierge support */}
              <div className="mt-lg p-base bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex gap-base items-center">
                <HelpCircle size={18} className="text-secondary shrink-0" />
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                  Have questions? Reach our 24/7 concierge at <span className="text-primary font-medium underline cursor-pointer">support@shopnest.com</span>
                </p>
              </div>

            </aside>
          </div>

        </div>
      </main>
    </div>
  );
};

export default OrderConfirmed;
