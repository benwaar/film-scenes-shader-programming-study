import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Minimal example using a fragment shader in Flutter.
/// If you don't plan to use Flutter right away, you can ignore this file;
/// the GLSL shaders stand alone and can be used in WebGL.
class HudLanguageTrainerDemo extends StatefulWidget {
  const HudLanguageTrainerDemo({super.key});
  @override State<HudLanguageTrainerDemo> createState() => _HudLanguageTrainerDemoState();
}

class _HudLanguageTrainerDemoState extends State<HudLanguageTrainerDemo>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker;
  double _t = 0.0; // seconds
  double _lock = 0.0; // 0..1

  FragmentProgram? _program;
  ImageShader? _eng, _toki;

  @override
  void initState(){
    super.initState();
    _load();
    _ticker = createTicker((elapsed){
      setState((){
        _t = elapsed.inMilliseconds / 1000.0;
        _lock = (_t / 3.0).clamp(0.0, 1.0);
      });
    })..start();
  }

  Future<void> _load() async {
    _program = await FragmentProgram.fromAsset('shaders/hud_text_flicker.frag');
    final e = await _loadImage('assets/text/eng_line.png');
    final t = await _loadImage('assets/text/toki_line.png');
    setState((){
      _eng = ImageShader(e, TileMode.clamp, TileMode.clamp, Matrix4.identity().storage);
      _toki = ImageShader(t, TileMode.clamp, TileMode.clamp, Matrix4.identity().storage);
    });
  }

  Future<Image> _loadImage(String asset) async {
    final bd = await rootBundle.load(asset);
    final codec = await PaintingBinding.instance.instantiateImageCodecWithSize(
      bd.buffer.asUint8List(),
    );
    final fi = await codec.getNextFrame();
    return fi.image;
  }

  @override
  void dispose(){ _ticker.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context){
    if(_program == null || _eng == null || _toki == null){
      return const SizedBox.shrink();
    }
    final shaderBuilder = (Size size){
      return _program!.shader(
        floatUniforms: Float32List.fromList([
          _t, _lock, size.width, size.height,
        ]),
        samplers: <ImageShader>[_eng!, _toki!],
      );
    };

    return Center(
      child: CustomPaint(
        painter: _ShaderPainter(shaderBuilder),
        size: const Size(1024, 256),
      ),
    );
  }
}

class _ShaderPainter extends CustomPainter{
  final Shader Function(Size size) build;
  _ShaderPainter(this.build);
  @override
  void paint(Canvas c, Size s){
    final p = Paint()..shader = build(s);
    c.drawRect(Offset.zero & s, p);
  }
  @override
  bool shouldRepaint(covariant _ShaderPainter old) => true;
}
