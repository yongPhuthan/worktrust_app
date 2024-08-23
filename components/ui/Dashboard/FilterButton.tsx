// FilterButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { InvoicesFilterLabels, QuotationsFilterLabels, ReceiptsFilterLabels, SubmissionFilterLabels, WarrantyFilterLabels } from '../../../mongoDbmodels/DocumentStatus'; 
import { InvoiceStatus, QuotationStatus , ReceiptStatus, SubmissionStatus, WarrantyStatus 
  
 } from '../../../types/enums';

type QuotationsFilterButtonProps = {
    filter: QuotationStatus
    isActive: boolean;
    onPress: () => void;
  };
  type InvoicesFilterButtonProps = {
    filter: InvoiceStatus
    isActive: boolean;
    onPress: () => void;
  };

  type ReceiptsFilterButtonProps = {
    filter: ReceiptStatus
    isActive: boolean;
    onPress: () => void;
  };

  type SubmissionFilterButtonProps = {
    filter: SubmissionStatus
    isActive: boolean;
    onPress: () => void;
  };

  type WarrantyFilterButtonProps = {
    filter: WarrantyStatus
    isActive: boolean;
    onPress: () => void;
  }

export const QuotationsFilterButton: React.FC<QuotationsFilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = QuotationsFilterButton[filter as keyof typeof QuotationsFilterLabels];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{ displayText}</Text>
      </TouchableOpacity>
    );
  };
  export const InvoicesFilterButton: React.FC<InvoicesFilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = InvoicesFilterLabels[filter as keyof typeof InvoicesFilterLabels];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{ displayText}</Text>
      </TouchableOpacity>
    );
  };

  export const ReceiptsFilterButton: React.FC<ReceiptsFilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = ReceiptsFilterLabels[filter as keyof typeof ReceiptsFilterLabels];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{ displayText}</Text>
      </TouchableOpacity>
    );
  };

  export const SubmissionFilterButton: React.FC<SubmissionFilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = SubmissionFilterLabels[filter as keyof typeof SubmissionFilterLabels];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{ displayText}</Text>
      </TouchableOpacity>
    );
  };


  export const WarrantyFilterButton: React.FC<WarrantyFilterButtonProps> = ({ filter, isActive, onPress }) => {
    const displayText = WarrantyFilterLabels[filter as keyof typeof WarrantyFilterLabels];
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive ? styles.activeFilter : null]}
        onPress={onPress}>
        <Text style={isActive ? { color: 'white' } : null}>{ displayText}</Text>
      </TouchableOpacity>
    );
  };



// Define styles for your FilterButton here
const styles = StyleSheet.create({
    filterButton: {
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 20,
        backgroundColor: '#E5E5E5',
        borderRadius: 8,
        height: 40,
      },
      activeFilter: {
        // backgroundColor:'#1b72e8',
        backgroundColor: '#1f303cff',
        color: 'white',
      },
});
