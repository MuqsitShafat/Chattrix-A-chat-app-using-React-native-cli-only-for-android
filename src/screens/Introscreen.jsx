import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useRef} from 'react';
import {
  Extrapolation,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import Carousel, {Pagination} from 'react-native-reanimated-carousel';
const {height, width} = Dimensions.get('window');

const Introscreen = () => {
  const data = [
    {id: 1, image: require('../images/Active2.png')},
    {id: 2, image: require('../images/Active1.png')},
  ];
  const ref = useRef(null);
  const progress = useSharedValue(0);

  const onPressPagination = index => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* above circle */}
      <View style={styles.blue_circle}>
        <View style={styles.text_above_circle}>
          <Text style={styles.text}>Welcome</Text>
        </View>
      </View>

      {/* background image */}
      <ImageBackground
        source={require('../images/emoji.png')}
        style={{flex: 1}}>
        <View style={styles.carousel}>
          <Carousel
            ref={ref}
            width={width}
            height={height / 2}
            data={data}
            onProgressChange={progress}
            renderItem={({item}) => (
              <View
                style={{
                  flex: 1,
                }}>
                <Image style={{margin: '0%'}} source={item.image} />
              </View>
            )}
          />

          <Pagination.Custom
            progress={progress}
            data={data.map(color => ({color}))}
            size={20}
            dotStyle={{
              width: 15,
              height: 15,
              borderRadius: 99999,
              backgroundColor: '#f1f1f1',
            }}
            activeDotStyle={{
              borderRadius: 99999,
              width: 25,
              height: 25,
              overflow: 'hidden',
              backgroundColor: '#6B6B6B',
            }}
            containerStyle={{
              gap: 5,
              // marginBottom: 10,
              alignItems: 'center',
              marginTop: '-14%',
              // height: 10,
            }}
            horizontal
            onPress={onPressPagination}
            customReanimatedStyle={(progress, index, length) => {
              let val = Math.abs(progress - index);
              if (index === 0 && progress > length - 1) {
                val = Math.abs(progress - length);
              }

              return {
                transform: [
                  {
                    translateY: interpolate(
                      val,
                      [0, 1],
                      [0, 0],
                      Extrapolation.CLAMP,
                    ),
                  },
                ],
              };
            }}
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.button_text}>Get Started</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default Introscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B6B6B6',
  },
  blue_circle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '30%',
    borderBottomLeftRadius: '50%',
    borderBottomRightRadius: '50%',
    backgroundColor: '#510DC0',
  },
  text_above_circle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 70,
    color: 'white',
    fontFamily: 'IrishGrover-Regular',
  },
  carousel: {
    flex: 1,
    marginTop: '10%',
  },
  button: {
    backgroundColor: '#510DC0',
    width: '80.5%',
    height: '9%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom  : '10%'
  },
  button_text: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'IrishGrover-Regular',
  },
});
