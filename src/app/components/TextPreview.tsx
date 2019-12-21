import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { formSelector } from '../redux/form/form.selector'

export default function TextPreview({ previewSize }) {
    const { formValues, formErrors } = useSelector(state => formSelector(state))
    const textPreviewStyling = useCallback(() => {
        let baseFontStyle = {
            color: formValues.fontColor,
            fontFamily: formValues.fontFamily,
            fontWeight: formValues.fontWeight,
            fontSize: `${formValues.fontSize}px`,
        }
        switch (formValues.textBaseline) {
            case 'custom':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    top: `${formValues.textYCoordinate}px`,
                    left: `${formValues.textXCoordinate}px`,
                    transform: `translate(-50%,-75%)`,
                    width: 'fit-content',
                }
            case 'bottom':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    textAlign: 'center',
                    top: '100%',
                    transform: 'translateY(-100%)',
                }
            case 'top':
                return {
                    ...baseFontStyle,
                    position: 'relative',
                    textAlign: 'center',
                    top: '0px',
                }
        }
    }, [formValues])

    return (
        <div style={{ width: previewSize.width, height: previewSize.height, position: 'absolute' }}>
            <div style={textPreviewStyling()}>{formValues.text}</div>
        </div>
    )
}
