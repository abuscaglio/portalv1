import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { EmployeeData } from './types';

export class DataTransformer {
  async fetchAndTransform(): Promise<EmployeeData[]> {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    
    if (querySnapshot.empty) {
      console.warn('⚠️ No documents found in employees collection');
      return [];
    }
    
    return querySnapshot.docs.map(doc => this.transformDocument(doc));
  }

  private transformDocument(doc: any): EmployeeData {
    const data = doc.data();
    const serialized = this.serializeFirestoreData(doc.id, data);
    return this.mapToEmployeeData(serialized);
  }

  private serializeFirestoreData(docId: string, data: any): any {
    const result: any = { id: docId, employeeId: docId };
    
    Object.entries(data).forEach(([key, value]) => {
      result[key] = (value as any)?.toDate ? (value as any).toDate().toISOString() : value;
    });
    
    return result;
  }

  private mapToEmployeeData(data: any): EmployeeData {
    const { monthlySales, monthlyTarget, yearlySales, yearlyTarget } = this.extractSalesData(data);
    
    return {
      id: data.id,
      employeeId: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      city: data.location?.city || '',
      state: data.location?.state || '',
      territory: data.location?.state || 'Unknown',
      monthlySales,
      monthlyTarget,
      yearlySales,
      yearlyTarget,
      amount: monthlySales,
      date: new Date()
    };
  }

  private extractSalesData(data: any) {
    if (!data.sales?.monthly) {
      return { monthlySales: 0, monthlyTarget: 0, yearlySales: 0, yearlyTarget: 0 };
    }
    
    const monthlyData = Object.values(data.sales.monthly);
    const monthlySales = monthlyData.reduce((sum: number, m: any) => sum + (m?.sold || 0), 0);
    const monthlyTargets = monthlyData.reduce((sum: number, m: any) => sum + (m?.target || 0), 0);
    
    const currentMonth = Object.keys(data.sales.monthly).pop();
    const currentData = currentMonth ? data.sales.monthly[currentMonth] : null;
    
    return {
      monthlySales: currentData?.sold || 0,
      monthlyTarget: currentData?.target || 0,
      yearlySales: monthlySales,
      yearlyTarget: data.sales?.yearly_target || monthlyTargets
    };
  }
}