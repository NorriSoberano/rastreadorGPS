import React from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Definición de la diferencia de latitud y longitud para la región y el marcador
const latitudeDelta = 0.001;
const longitudeDelta = 0.001;

class Estilo extends React.Component {
  state = {
    // Estado inicial con la región y el marcador
    region: {
      latitudeDelta,
      longitudeDelta,
      latitude: 27.50497,
      longitude: -109.95777,
    },
    marker: {
      latitudeDelta,
      longitudeDelta,
      latitude: 27.50497,
      longitude: -109.95777,
    },
    isTracking: true, // Indica si se está rastreando la ubicación
  };

  // Función para actualizar el estado con una nueva región
  onChangValue = (region) => {
    this.setState({
      region,
    });
  };

  // Función para alternar el rastreo de ubicación
  toggleTracking = () => {
    this.setState((prevState) => ({
      isTracking: !prevState.isTracking,
    }));
  };

  // Función para obtener la ubicación desde el servidor
  getLocation = () => {
    if (!this.state.isTracking) {
      return;
    }

    // Hace una solicitud al servidor para obtener datos de ubicación
    fetch('https://bryangn.pythonanywhere.com/api/gpsdata/')
      .then((response) => response.json())
      .then((jsonData) => {
        if (jsonData.length > 0) {
          // Obtiene los datos más recientes y actualiza el estado
          const latestData = jsonData[jsonData.length - 1];

          this.setState({
            marker: {
              latitudeDelta,
              longitudeDelta,
              latitude: latestData.latitude,
              longitude: latestData.longitude,
            },
          });

          // Centra el mapa en la ubicación más reciente
          if (_mapView) {
            _mapView.animateToRegion({
              latitude: latestData.latitude,
              longitude: latestData.longitude,
              latitudeDelta,
              longitudeDelta,
            }, 1000);
          }
        }
      })
      .catch((error) => console.error(error));
  };

  // Configuración de la ejecución de getLocation cada segundo al montar el componente
  componentDidMount() {
    this.interval = setInterval(this.getLocation, 1000);
  }

  // Limpieza del intervalo al desmontar el componente
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // Renderización del componente
  render() {
    return (
      <View style={styles.container}>
        {/* MapView para mostrar el mapa */}
        <MapView
          style={styles.map}
          initialRegion={this.state.region}
          onRegionChange={this.onChangValue}
          ref={(mapView) => { _mapView = mapView; }}
        >
          {/* Marcador en la posición actual */}
          <Marker coordinate={this.state.marker} />
        </MapView>
        {/* Botón para alternar el rastreo */}
        <View style={styles.buttonContainer}>
          <Button
            title={this.state.isTracking ? 'Off' : 'On'}
            onPress={this.toggleTracking}
          />
        </View>
      </View>
    );
  }
}

export default Estilo;

// Estilos para el componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
