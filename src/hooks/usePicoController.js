import { useEffect, useRef } from 'react';

/**
 * PICO VR Controller Hook
 * 适配 PICO 4 / PICO Neo 3 浏览器手柄输入
 * 
 * @param {Object} props
 * @param {Function} props.handleButtonPress - 处理按钮按下事件
 * @param {Function} props.handleButtonRelease - 处理按钮松开事件
 * @param {boolean} props.isLoaded - Unity 是否加载完成
 * @param {boolean} props.isConnected - JSBridge 是否连接
 */
const usePicoController = ({
  handleButtonPress,
  handleButtonRelease,
  isLoaded,
  isConnected
}) => {
  // 用于存储上一帧的按钮和摇杆状态，以便检测状态变化
  const prevButtonsRef = useRef({});
  const prevAxesRef = useRef({
    left: false,
    right: false,
    forward: false,
    back: false
  });
  
  const requestRef = useRef();

  useEffect(() => {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        // 仅处理 PICO 手柄或标准 XR 手柄
        // PICO 浏览器通常会在 id 中包含 "PICO" 或 "Oculus" (兼容模式)
        // 或者 mapping 为 "xr-standard"
        const isPico = gp.id.toLowerCase().includes('pico') || gp.mapping === 'xr-standard';
        
        if (isPico) {
          handleGamepadInput(gp);
        }
      }

      requestRef.current = requestAnimationFrame(pollGamepads);
    };

    const handleGamepadInput = (gp) => {
      // --- 摇杆处理 (Axes) ---
      // 通常 Axes[2] 是水平 (X), Axes[3] 是垂直 (Y)
      // 但不同浏览器/设备可能不同，标准 Gamepad API 通常是 Axes[0] (Left X), Axes[1] (Left Y)
      // WebXR 映射通常保留 Axes[2]/[3] 给主摇杆
      
      // PICO 浏览器 WebXR 模式下：
      // Axes[2]: X轴 (-1 左, 1 右)
      // Axes[3]: Y轴 (-1 前/上, 1 后/下)
      const xAxis = gp.axes[2] || gp.axes[0] || 0; 
      const yAxis = gp.axes[3] || gp.axes[1] || 0;
      
      const DEADZONE = 0.2;

      // 状态快照
      const currentAxes = {
        left: xAxis < -DEADZONE,
        right: xAxis > DEADZONE,
        forward: yAxis < -DEADZONE, // Y轴负向通常是前
        back: yAxis > DEADZONE
      };

      const prevAxes = prevAxesRef.current;

      // 检测变化并触发回调
      // Forward
      if (currentAxes.forward && !prevAxes.forward) handleButtonPress('forward');
      if (!currentAxes.forward && prevAxes.forward) handleButtonRelease('forward');

      // Back
      if (currentAxes.back && !prevAxes.back) handleButtonPress('back');
      if (!currentAxes.back && prevAxes.back) handleButtonRelease('back');

      // Left
      if (currentAxes.left && !prevAxes.left) handleButtonPress('left');
      if (!currentAxes.left && prevAxes.left) handleButtonRelease('left');

      // Right
      if (currentAxes.right && !prevAxes.right) handleButtonPress('right');
      if (!currentAxes.right && prevAxes.right) handleButtonRelease('right');

      // 更新 Axes 状态
      prevAxesRef.current = currentAxes;


      // --- 按钮处理 (Buttons) ---
      // 映射规则:
      // Button 0 (Trigger): place_water
      // Button 1 (Grip): place_food
      // Button 4 (A) / 5 (B): place_food (备用)
      // Button 10 (Thumbstick Press): toggle_flashlight

      const buttonsToMap = [
        { index: 0, action: 'place_water' },       // Trigger
        { index: 1, action: 'place_food' },        // Grip
        { index: 4, action: 'place_food' },        // A / X
        { index: 5, action: 'place_food' },        // B / Y
        { index: 10, action: 'toggle_flashlight' } // Stick Press
      ];

      buttonsToMap.forEach(({ index, action }) => {
        if (gp.buttons[index]) {
          const isPressed = gp.buttons[index].pressed;
          const wasPressed = prevButtonsRef.current[index] || false;

          if (isPressed && !wasPressed) {
            handleButtonPress(action);
          }
          if (!isPressed && wasPressed) {
            handleButtonRelease(action);
          }
          
          // 更新该按钮状态
          prevButtonsRef.current[index] = isPressed;
        }
      });
    };

    // 启动轮询
    requestRef.current = requestAnimationFrame(pollGamepads);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [handleButtonPress, handleButtonRelease, isLoaded, isConnected]); // 依赖项变化时重启 Effect
};

export default usePicoController;
