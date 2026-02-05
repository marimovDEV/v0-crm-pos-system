# POS Page Enhancement Recipe

## Changes Required:

### 1. Import New Components and Hooks
```typescript
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { KeyboardShortcutsOverlay } from '@/components/keyboard-shortcuts-overlay'
import { ScannerStatus } from '@/components/scanner-status'
import { barcodeApi, voiceFeedback } from '@/lib/api'
```

### 2. Update Product Interface
Add new fields to match backend:
- base_unit, sell_unit, unit_ratio
- barcodes array
- is_low_stock boolean
- stock_display string

### 3. Add Scanner and Keyboard State
```typescript
const [scannerEnabled, setScannerEnabled] = useState(true)
const [voiceEnabled, setVoiceEnabled] = useState(true)
const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
```

### 4. Implement Barcode Scanner Hook
```typescript
const { isScanning, lastScan, scanCount } = useBarcodeScanner({
  onScan: handleBarcodeScan,
  enabled: scannerEnabled && step === 1,
})
```

### 5. Implement Keyboard Shortcuts
```typescript
const shortcuts = useKeyboardShortcuts({
  shortcuts: [
    { key: 'F9', description: 'Sotishni yakunlash', action: () => step === 2 && handleCheckout() },
    { key: 'F8', description: 'Qarzga sotish', action: () => handleDebtSale() },
    { key: 'Escape', description: 'Bekor qilish', action: resetPOS },
    { key: '?', description: 'Yordam', action: () => setShowShortcutsHelp(prev => !prev) },
  ],
  enabled: true,
})
```

### 6. Add Barcode Scan Handler
```typescript
const handleBarcodeScan = async (barcode: string) => {
  try {
    const result = await barcodeApi.lookup(barcode)
    if (result.success) {
      addToCart(result.product)
      voiceFeedback.speak(result.voice_message, voiceEnabled)
      voiceFeedback.playBeep(true)
    }
  } catch (error) {
    voiceFeedback.speak('Mahsulot topilmadi', voiceEnabled)
    voiceFeedback.playBeep(false)
  }
}
```

### 7. Add Quick Debt Sale Handler
```typescript
const handleDebtSale = () => {
  if (step === 1 && cart.length > 0) {
    setStep(2)
    setPaymentMethod('debt')
  }
}
```

### 8. Add Scanner Status to Header
Add `<ScannerStatus>` component next to branch selector

### 9. Add Keyboard Shortcuts Overlay
Add at end of return before closing SidebarProvider:
```typescript
<KeyboardShortcutsOverlay 
  shortcuts={shortcuts}
  isVisible={showShortcutsHelp}
  onClose={() => setShowShortcutsHelp(false)}
/>
```

### 10. Update handleCheckout
Add keyboard shortcut tracking:
```typescript
keyboard_shortcut_used: lastUsedShortcut || null,
scanner_used: scanCount > 0,
```

This is a working recipe to enhance POS with scanner + keyboard support!
