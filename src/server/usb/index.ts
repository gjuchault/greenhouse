import SerialPort from 'serialport'

export interface USBDevice {
  path: string
  kind: 'arduino' | 'radio'
}

const rport = /usb|acm|^com/i
const isArduino = /arduino/i
const isRadio = /RFXtrx433/i

export function buildListUsbDevices() {
  async function listUsbDevices() {
    const usbPorts = await SerialPort.list()

    const results: USBDevice[] = []

    for (const { path, pnpId } of usbPorts) {
      if (!rport.test(path)) {
        continue
      }

      if (isArduino.test(pnpId || '')) {
        results.push({
          path,
          kind: 'arduino',
        })
      }

      if (isRadio.test(pnpId || '')) {
        results.push({
          path,
          kind: 'radio',
        })
      }
    }

    return results
  }

  return listUsbDevices
}
