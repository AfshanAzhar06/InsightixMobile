// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Dimensions,
//   Alert
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API from '../../src/Services/api';
// import Header from '../../components/AnalyticsHeader';

// const { width } = Dimensions.get('window');

// const NoDataMessage = ({ message, dateInfo }) => (
//   <View style={styles.noDataContainer}>
//     <Text style={styles.noDataIcon}>📊</Text>
//     <Text style={styles.noDataTitle}>{message || 'No Data Available'}</Text>
//     {dateInfo && (
//       <View style={styles.dateInfoContainer}>
//         <Text style={styles.dateInfoText}>📅 Date: {dateInfo.date}</Text>
//         {dateInfo.time && <Text style={styles.dateInfoText}>🕐 Time: {dateInfo.time}</Text>}
//       </View>
//     )}
//   </View>
// );

// const Analytics = () => {
//   const [selectedCameraId, setSelectedCameraId] = useState('');
//   const [devices, setDevices] = useState([]);
//   const [startDateTime, setStartDateTime] = useState(null);
//   const [endDateTime, setEndDateTime] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   const [lineChartData, setLineChartData] = useState([]);
//   const [hourlyEnterData, setHourlyEnterData] = useState([]);
//   const [hourlyExitData, setHourlyExitData] = useState([]);
//   const [utilizationPercent, setUtilizationPercent] = useState(null);
//   const [spaceUtilizationHistory, setSpaceUtilizationHistory] = useState([]);
//   const [alertPieData, setAlertPieData] = useState([]);
//   const [objectPieData, setObjectPieData] = useState([]);
//   const [animalPieData, setAnimalPieData] = useState([]);
//   const [animalTimeData, setAnimalTimeData] = useState([]);
//   const [queueChartData, setQueueChartData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [noDataMessage, setNoDataMessage] = useState(null);
//   const [selectedDateInfo, setSelectedDateInfo] = useState(null);

//   const today = new Date();
//   today.setHours(23, 59, 59, 999);

//   // AUTH CHECK
//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = await AsyncStorage.getItem('token');
//       if (!token) {
//         Alert.alert('Authentication Required', 'You must be logged in to access the dashboard.');
//         return;
//       }
//     };
//     checkAuth();
//   }, []);

//   // FETCH DEVICES
//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const response = await API.get('/devices');
//         setDevices(response.data);
//       } catch (error) {
//         console.error('Error fetching devices:', error);
//         Alert.alert('Error', 'Failed to fetch devices');
//       }
//     };
//     fetchDevices();
//   }, []);

//   // LOAD LAST CAMERA
//   useEffect(() => {
//     const loadLastCamera = async () => {
//       const lastCameraId = await AsyncStorage.getItem('lastCameraId');
//       if (lastCameraId) setSelectedCameraId(lastCameraId);
//     };
//     loadLastCamera();
//   }, []);

//   // HELPER FUNCTIONS
//   const formatHourLabel = (h) => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;

//   const calculateHourlyAverage = (stats, key) => {
//     const hourlyMap = {};
//     stats.forEach(item => {
//       const hour = new Date(item.timestamp).getHours();
//       if (!hourlyMap[hour]) hourlyMap[hour] = [];
//       hourlyMap[hour].push(item[key]);
//     });
//     return Array.from({length:24},(_,h)=>{
//       const vals = hourlyMap[h]||[];
//       const avg = vals.length? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
//       return { hour: formatHourLabel(h), avgEnter: key==='entered'?avg:undefined, avgExit: key==='exited'?avg:undefined };
//     });
//   };

//   const buildAnimalTimeData = (stats) => {
//     const map = {};
//     stats.forEach(item=>{
//       const time = new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
//       (item.detectedAnimals||[]).forEach(a=>{
//         if(!map[time]) map[time]={time,count:0,animals:new Set()};
//         map[time].count+=1;
//         map[time].animals.add(a);
//       });
//     });
//     return Object.values(map).map(i=>({time:i.time,count:i.count,animalNames:Array.from(i.animals)}));
//   };

//   // FETCH DATA
//   useEffect(() => {
//     if(!selectedCameraId) return;
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         let params = {};
//         if(startDateTime){ params.date=startDateTime.toISOString().split('T')[0]; }
//         const res = await API.get(`/camera-stats/filter/${selectedCameraId}`,{params});
//         const data = res.data.data || [];

//         // Line Chart
//         const formatted = data.map(i=>({
//           time: new Date(i.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),
//           enter:i.entered, exit:i.exited, currentInside:i.entered-i.exited, utilization:i.utilization
//         }));
//         setLineChartData(formatted);

//         // Hourly Average
//         setHourlyEnterData(calculateHourlyAverage(data,'entered'));
//         setHourlyExitData(calculateHourlyAverage(data,'exited'));

//         // Space Utilization
//         setSpaceUtilizationHistory(formatted.map(i=>({time:i.time, utilization:i.utilization})));
//         setUtilizationPercent(formatted.length?Math.round(formatted.reduce((s,i)=>s+i.utilization,0)/formatted.length):0);

//         // Alerts, Objects, Animals, Queue
//         setAlertPieData(res.data.alerts || []);
//         setObjectPieData(res.data.objects || []);
//         setAnimalPieData(res.data.animals || []);
//         setAnimalTimeData(buildAnimalTimeData(data));
//         setQueueChartData(res.data.queue || []);

//         setNoDataMessage(null);
//         setSelectedDateInfo(null);
//       } catch(err){
//         console.error(err);
//         setNoDataMessage('Error loading data');
//       } finally{ setLoading(false); }
//     };
//     fetchData();
//   },[selectedCameraId,startDateTime,endDateTime]);

//   // RENDER FUNCTIONS FOR CHARTS
//   const renderLineChart = (data) => data.length===0 ? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo}/> :
//     <LineChart data={{labels:data.map(d=>d.time), datasets:[{data:data.map(d=>d.enter),color:()=>'#16a34a'},{data:data.map(d=>d.exit),color:()=>'#dc2626'}], legend:['Enter','Exit']}} width={width-40} height={220} chartConfig={{backgroundColor:'#fff',backgroundGradientFrom:'#fff',backgroundGradientTo:'#fff',decimalPlaces:0,color:()=> '#125049',labelColor:()=> '#333',propsForDots:{r:'4',strokeWidth:'2'}}} bezier style={styles.chart}/>

//   const renderBarChart = (data,key,label) => data.length===0 ? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo}/> :
//     <BarChart data={{labels:data.map(d=>d.hour), datasets:[{data:data.map(d=>key==='avgEnter'?d.avgEnter:d.avgExit)}]}} width={width-40} height={220} yAxisLabel="" chartConfig={{backgroundColor:'#fff',backgroundGradientFrom:'#fff',backgroundGradientTo:'#fff',decimalPlaces:0,color:()=> '#0b6b58',labelColor:()=> '#333'}} style={styles.chart} />;

//   const renderPieChart = (data) => data.length===0 ? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo}/> :
//     <PieChart data={data.map(d=>({name:d.name,value:d.value,color:d.color||'#16a34a',legendFontColor:'#333',legendFontSize:14}))} width={width-40} height={220} chartConfig={{color:()=> '#125049'}} accessor="value" backgroundColor="transparent" paddingLeft="15" absolute />;

//   return (
//     <View style={styles.container}>
//       <Header />
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

//         {/* Camera Picker */}
//         <View style={styles.card}>
//           <Text style={styles.label}>Camera Location</Text>
//           <Picker selectedValue={selectedCameraId} onValueChange={setSelectedCameraId} style={styles.picker}>
//             <Picker.Item label="Select Camera" value="" />
//             {devices.map(d=><Picker.Item key={d._id} label={`${d.name} - ${d.location}`} value={d._id}/>)}
//           </Picker>
//         </View>

//         {/* Date & Time */}
//         <View style={styles.dateTimeContainer}>
//           <View style={styles.dateCard}>
//             <Text style={styles.dateLabel}>Select Date</Text>
//             <TouchableOpacity style={styles.dateButton} onPress={()=>setShowDatePicker(true)}>
//               <Ionicons name="calendar-outline" size={20} color="#125049" />
//               <Text style={styles.dateButtonText}>{startDateTime?startDateTime.toLocaleDateString():'Choose date'}</Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.dateCard}>
//             <Text style={styles.dateLabel}>Select Time</Text>
//             <TouchableOpacity style={styles.dateButton} onPress={()=>setShowTimePicker(true)}>
//               <Ionicons name="time-outline" size={20} color="#125049" />
//               <Text style={styles.dateButtonText}>{endDateTime?endDateTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):'Choose time'}</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {showDatePicker && <DateTimePicker value={startDateTime||new Date()} mode="date" display="default" maximumDate={today} onChange={(e,d)=>{setShowDatePicker(false);if(d)setStartDateTime(d);}} />}
//         {showTimePicker && <DateTimePicker value={endDateTime||new Date()} mode="time" display="default" onChange={(e,d)=>{setShowTimePicker(false);if(d)setEndDateTime(d);}} />}
//         {loading && <ActivityIndicator size="large" color="#125049" style={{margin:20}} />}

//         {/* Human Counting Line */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Human Counting</Text>{renderLineChart(lineChartData)}</View>

//         {/* Hourly Enter & Exit */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Hourly Average Entries</Text>{renderBarChart(hourlyEnterData,'avgEnter','Average Enter')}</View>
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Hourly Average Exits</Text>{renderBarChart(hourlyExitData,'avgExit','Average Exit')}</View>

//         {/* Space Utilization Pie */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Space Utilization</Text>{renderPieChart([{name:'Used',value:utilizationPercent,color:'#0b6b58'},{name:'Free',value:100-utilizationPercent,color:'#e0e0e0'}])}<Text style={styles.utilizationText}>{utilizationPercent}% Used</Text></View>

//         {/* Utilization Over Time */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Utilization Over Time</Text>{renderLineChart(spaceUtilizationHistory.map(i=>({time:i.time,enter:i.utilization,exit:0})) )}</View>

//         {/* Alerts Pie */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Alerts Summary</Text>{renderPieChart(alertPieData)}</View>

//         {/* Object Detection Pie */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Object Detection Distribution</Text>{renderPieChart(objectPieData)}</View>

//         {/* Queue Size */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Queue Size Over Time</Text>{renderLineChart(queueChartData.map(i=>({time:i.time,enter:i.queueSize,exit:0})))}</View>

//         {/* Animal Pie & Over Time */}
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Animal Detection Distribution</Text>{renderPieChart(animalPieData)}</View>
//         <View style={styles.chartCard}><Text style={styles.chartTitle}>Animals Detected Over Time</Text>{renderLineChart(animalTimeData.map(i=>({time:i.time,enter:i.count,exit:0})))}</View>

//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container:{flex:1,backgroundColor:'#f5f5f5'},
//   scrollView:{flex:1,padding:20},
//   card:{backgroundColor:'#fff',borderRadius:12,padding:16,marginBottom:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3},
//   label:{fontSize:16,fontWeight:'600',marginBottom:8,color:'#125049'},
//   picker:{height:50},
//   dateTimeContainer:{flexDirection:'row',gap:4,marginBottom:16},
//   dateCard:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3},
//   dateLabel:{fontSize:14,fontWeight:'600',marginBottom:8,color:'#125049'},
//   dateButton:{flexDirection:'row',alignItems:'center',padding:12,borderWidth:1,borderColor:'#ddd',borderRadius:8,gap:8},
//   dateButtonText:{fontSize:14,color:'#333'},
//   chartCard:{backgroundColor:'#fff',borderRadius:12,padding:16,marginBottom:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3},
//   chartTitle:{fontSize:18,fontWeight:'700',marginBottom:12,color:'#125049'},
//   chart:{marginVertical:8,borderRadius:16},
//   utilizationText:{textAlign:'center',fontWeight:'700',fontSize:18,marginTop:12,color:'#125049'},
//   noDataContainer:{padding:40,backgroundColor:'#fef2f2',borderRadius:8,borderWidth:1,borderColor:'#fecaca',alignItems:'center',marginVertical:20},
//   noDataIcon:{fontSize:24,marginBottom:8},
//   noDataTitle:{fontWeight:'700',fontSize:16,color:'#dc2626',marginBottom:8,textAlign:'center'},
//   dateInfoContainer:{marginTop:8},
//   dateInfoText:{fontSize:14,color:'#991b1b',textAlign:'center'}
// });

// export default Analytics;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../src/Services/api';
import Header from '../../components/AnalyticsHeader';

const { width } = Dimensions.get('window');

// No Data Component
const NoDataMessage = ({ message, dateInfo }) => (
  <View style={styles.noDataContainer}>
    <Text style={styles.noDataIcon}>📊</Text>
    <Text style={styles.noDataTitle}>{message || 'No Data Available'}</Text>
    {dateInfo && (
      <View style={styles.dateInfoContainer}>
        <Text style={styles.dateInfoText}>📅 Date: {dateInfo.date}</Text>
        {dateInfo.time && <Text style={styles.dateInfoText}>🕐 Time: {dateInfo.time}</Text>}
      </View>
    )}
  </View>
);

const Analytics = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraId = params?.cameraId;

  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [devices, setDevices] = useState([]);
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [lineChartData, setLineChartData] = useState([]);
  const [utilizationPercent, setUtilizationPercent] = useState(0);
  const [spaceUtilizationHistory, setSpaceUtilizationHistory] = useState([]);
  const [noDataMessage, setNoDataMessage] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // AUTH CHECK
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Authentication Required', 'You must be logged in to access the dashboard.');
          router.replace('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, []);

  // FETCH DEVICES
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await API.get('/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
        Alert.alert('Error', 'Failed to fetch devices');
      }
    };
    fetchDevices();
  }, []);

  // FETCH LAST SELECTED CAMERA
  useEffect(() => {
    const loadLastCamera = async () => {
      try {
        const lastCameraId = await AsyncStorage.getItem('lastCameraId');
        if (lastCameraId) setSelectedCameraId(lastCameraId);
      } catch (error) {
        console.error('Error loading last camera:', error);
      }
    };
    loadLastCamera();
  }, []);

  // FETCH DATA
  useEffect(() => {
    if (!selectedCameraId) {
      setLineChartData([]);
      setSpaceUtilizationHistory([]);
      setUtilizationPercent(0);
      setNoDataMessage(null);
      setSelectedDateInfo(null);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let url = `/camera-stats/filter/${selectedCameraId}`;
        let params = {};
        if (startDateTime) {
          params.date = startDateTime.toISOString().split('T')[0];
          if (endDateTime) {
            params.time = `${endDateTime.getHours().toString().padStart(2,'0')}:${endDateTime.getMinutes().toString().padStart(2,'0')}`;
          }
        }
        const response = await API.get(url, { params });

        if (response.data.success && response.data.data?.length > 0) {
          const formattedData = response.data.data.map((item) => ({
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            enter: item.entered,
            exit: item.exited,
            current: item.entered - item.exited,
            utilization: item.utilization
          }));
          setLineChartData(formattedData);
          setSpaceUtilizationHistory(formattedData.map(i => ({ time: i.time, utilization: i.utilization })));
          const avgUtil = Math.round(formattedData.reduce((sum,i)=>sum+i.utilization,0)/formattedData.length);
          setUtilizationPercent(avgUtil);
          setNoDataMessage(null);
          setSelectedDateInfo(null);
        } else {
          setLineChartData([]);
          setSpaceUtilizationHistory([]);
          setUtilizationPercent(null);
          if (startDateTime) {
            const dateStr = startDateTime.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
            const timeStr = endDateTime ? endDateTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : null;
            setSelectedDateInfo({ date: dateStr, time: timeStr });
            setNoDataMessage(timeStr ? 'No data available for selected date & time' : 'No data available for selected date');
          } else {
            setNoDataMessage('No live data available');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLineChartData([]);
        setSpaceUtilizationHistory([]);
        setUtilizationPercent(null);
        setNoDataMessage('Error loading data. Please try again.');
        setSelectedDateInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, startDateTime ? 0 : 5000);
    return () => clearInterval(interval);
  }, [selectedCameraId, startDateTime, endDateTime]);

  // HANDLERS
  const handleCameraChange = async (itemValue) => {
    setSelectedCameraId(itemValue);
    const selected = devices.find(d => d._id === itemValue);
    try {
      await AsyncStorage.setItem('lastCameraId', itemValue);
      await AsyncStorage.setItem('lastCameraLocation', selected?.location || '');
    } catch (err) { console.error(err); }
  };

  const handleDateChange = (event, date) => { setShowDatePicker(false); if (date) setStartDateTime(date); };
  const handleTimeChange = (event, time) => { setShowTimePicker(false); if (time) setEndDateTime(time); };
  const clearDate = () => { setStartDateTime(null); setEndDateTime(null); };

  // Chart Data
  const prepareLineChartData = () => {
    if (!lineChartData.length) return null;
    const labels = lineChartData.map((i,index)=> index%Math.ceil(lineChartData.length/6)===0 ? i.time : '');
    return {
      labels,
      datasets: [
        { data: lineChartData.map(i=>i.enter), color:()=> '#16a34a', strokeWidth:2 },
        { data: lineChartData.map(i=>i.exit), color:()=> '#dc2626', strokeWidth:2 },
      ],
      legend:['Enter','Exit']
    };
  };

  const preparePieChartData = () => {
    if (utilizationPercent===null) return null;
    return [
      { name:'Used', population: utilizationPercent, color:'#0b6b58', legendFontColor:'#333', legendFontSize:14 },
      { name:'Free', population: 100 - utilizationPercent, color:'#e0e0e0', legendFontColor:'#333', legendFontSize:14 }
    ];
  };

  const prepareBarChartData = () => {
    if (!spaceUtilizationHistory.length) return null;
    const labels = spaceUtilizationHistory.map((i,index)=> index%Math.ceil(spaceUtilizationHistory.length/6)===0 ? i.time : '');
    return { labels, datasets:[{ data: spaceUtilizationHistory.map(i=>i.utilization) }] };
  };

  // RENDER
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Camera */}
        <View style={styles.card}>
          <Text style={styles.label}>Camera Location</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedCameraId} onValueChange={handleCameraChange} style={styles.picker}>
              <Picker.Item label="Select Camera" value="" />
              {devices.map(d=> <Picker.Item key={d._id} label={`${d.name} - ${d.location}`} value={d._id} /> )}
            </Picker>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Select Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={()=>setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#125049" />
              <Text style={styles.dateButtonText}>{startDateTime?startDateTime.toLocaleDateString('en-GB'):'Choose date'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateCard}>
            <Text style={styles.dateLabel}>Select Time</Text>
            <TouchableOpacity style={styles.dateButton} onPress={()=>setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#125049" />
              <Text style={styles.dateButtonText}>{endDateTime?endDateTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}):'Choose time'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(startDateTime||endDateTime)&&(
          <TouchableOpacity style={styles.clearButton} onPress={clearDate}>
            <Text style={styles.clearButtonText}>Clear Date & Time</Text>
          </TouchableOpacity>
        )}

        {showDatePicker && <DateTimePicker value={startDateTime||new Date()} mode="date" display="default" maximumDate={today} onChange={handleDateChange} />}
        {showTimePicker && <DateTimePicker value={endDateTime||new Date()} mode="time" display="default" onChange={handleTimeChange} />}
        {loading && <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#125049" /></View>}

        {/* Human Counting */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Human Counting</Text>
          {lineChartData.length===0 ? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo} /> :
            <LineChart data={prepareLineChartData()} width={width-60} height={220} chartConfig={{ backgroundColor:'#fff', backgroundGradientFrom:'#fff', backgroundGradientTo:'#fff', decimalPlaces:0, color:()=>'#125049', labelColor:()=> '#333', style:{borderRadius:16}, propsForDots:{r:'4', strokeWidth:'2'}}} bezier style={styles.chart} />}
        </View>

        {/* Space Utilization Pie */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Space Utilization</Text>
          {utilizationPercent===null? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo} /> :
            <>
              <PieChart data={preparePieChartData()} width={width-60} height={200} chartConfig={{color:()=> '#125049'}} accessor="population" backgroundColor="transparent" paddingLeft="15" absolute />
              <Text style={styles.utilizationText}>{utilizationPercent}% Used</Text>
            </>}
        </View>

        {/* Utilization Over Time Bar */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Utilization Over Time</Text>
          {spaceUtilizationHistory.length===0? <NoDataMessage message={noDataMessage} dateInfo={selectedDateInfo} /> :
            <BarChart data={prepareBarChartData()} width={width-60} height={220} yAxisLabel="" yAxisSuffix="%" chartConfig={{ backgroundColor:'#fff', backgroundGradientFrom:'#fff', backgroundGradientTo:'#fff', decimalPlaces:0, color:()=> '#0b6b58', labelColor:()=> '#333', style:{borderRadius:16}}} style={styles.chart} />}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex:1, backgroundColor:'#f5f5f5'},
  scrollView:{flex:1, padding:20},
  card:{backgroundColor:'#fff', borderRadius:12, padding:16, marginBottom:16, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:3},
  label:{fontSize:16, fontWeight:'600', marginBottom:8, color:'#125049'},
  pickerContainer:{borderWidth:1,borderColor:'#ddd',borderRadius:8,overflow:'hidden'},
  picker:{height:50},
  dateTimeContainer:{flexDirection:'row',gap:4,marginBottom:16},
  dateCard:{flex:1,backgroundColor:'#fff',borderRadius:12,padding:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3},
  dateLabel:{fontSize:14,fontWeight:'600',marginBottom:8,color:'#125049'},
  dateButton:{flexDirection:'row',alignItems:'center',padding:12,borderWidth:1,borderColor:'#ddd',borderRadius:8,gap:8},
  dateButtonText:{fontSize:14,color:'#333'},
  clearButton:{backgroundColor:'#dc2626',padding:12,borderRadius:8,alignItems:'center',marginBottom:16},
  clearButtonText:{color:'#fff',fontWeight:'600',fontSize:14},
  loadingContainer:{padding:40,alignItems:'center'},
  chartCard:{backgroundColor:'#fff',borderRadius:12,padding:16,marginBottom:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4,elevation:3},
  chartTitle:{fontSize:18,fontWeight:'700',marginBottom:12,color:'#125049'},
  chart:{marginVertical:8,borderRadius:16},
  utilizationText:{textAlign:'center',fontWeight:'700',fontSize:18,marginTop:12,color:'#125049'},
  noDataContainer:{padding:40,backgroundColor:'#fef2f2',borderRadius:8,borderWidth:1,borderColor:'#fecaca',alignItems:'center',marginVertical:20},
  noDataIcon:{fontSize:24,marginBottom:8},
  noDataTitle:{fontWeight:'700',fontSize:16,color:'#dc2626',marginBottom:8,textAlign:'center'},
  dateInfoContainer:{marginTop:8},
  dateInfoText:{fontSize:14,color:'#991b1b',textAlign:'center'}
});

export default Analytics;
